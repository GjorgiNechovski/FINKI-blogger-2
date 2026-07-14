from datetime import datetime

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.encoders import jsonable_encoder

from starlette.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse

import zookeper
from Dtos import User, CreateBlogDto
from database import engine, SessionLocal
import models
from util import get_user_from_request
from sqlalchemy.orm import Session, joinedload

from opentelemetry import trace

app = FastAPI()
tracer = trace.get_tracer("blog-service")

models.Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


zk_client = None
service_port = None

@app.on_event("startup")
async def startup_event():
    global zk_client, service_port
    zk_client = zookeper.connect_to_zookeeper()
    service_port = zookeper.register_service(zk_client)
    app.port = service_port


@app.on_event("shutdown")
async def shutdown_event():
    if zk_client:
        zk_client.stop()

@app.get("/blogs")
def get_blogs(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    # Paginated: never return the whole table. 'limit' is capped (le=100) so one
    # request can only ever serialize a bounded page, not every blog. Ordering by
    # id desc (newest first) makes paging stable across requests.
    with tracer.start_as_current_span("blog.list") as span:
        total = db.query(models.Blog).count()
        blogs = (
            db.query(models.Blog)
            .order_by(models.Blog.id.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        span.set_attribute("blog.count", len(blogs))
        span.set_attribute("blog.total", total)
        span.set_attribute("blog.skip", skip)
        span.set_attribute("blog.limit", limit)
        return JSONResponse(content={
            "items": jsonable_encoder(blogs),
            "total": total,
            "skip": skip,
            "limit": limit,
        })

@app.post("/create")
def create(blog: CreateBlogDto, user: User = Depends(get_user_from_request), db: Session = Depends(get_db)):
    with tracer.start_as_current_span("blog.create") as span:
        span.set_attribute("blog.title", blog.title)
        span.set_attribute("user.name", user.userName)

        new_blog: models.Blog = models.Blog(
            title=blog.title,
            blog_text=blog.blog_text,
            user_id=user.userName,
            date_created = datetime.now(),
            number_of_likes = 0
        )

        db.add(new_blog)
        db.commit()
        db.refresh(new_blog)

        span.set_attribute("blog.id", new_blog.id)
        return_blog = jsonable_encoder(new_blog)

        return JSONResponse(content=return_blog)


@app.get("/blogs/{blog_id}")
def get_blog(blog_id: int, db: Session = Depends(get_db)):
    with tracer.start_as_current_span("blog.get") as span:
        span.set_attribute("blog.id", blog_id)
        blog = db.query(models.Blog).options(joinedload(models.Blog.comments)).filter(models.Blog.id == blog_id).first()
        if not blog:
            span.set_attribute("blog.found", False)
            raise HTTPException(status_code=404, detail="Blog not found")

        span.set_attribute("blog.found", True)
        return JSONResponse(content=jsonable_encoder(blog))


@app.post("/deleteBlog/{blog_id}")
def delete_blog(blog_id: int, db: Session = Depends(get_db)):
    blog = db.query(models.Blog).filter(models.Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    db.delete(blog)
    db.commit()

    return JSONResponse(status_code=200, content={"message": "Blog deleted successfully"})