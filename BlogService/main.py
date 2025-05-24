from datetime import datetime

from fastapi import FastAPI, Depends, HTTPException
from fastapi.encoders import jsonable_encoder

from starlette.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse

import zookeper
from Dtos import User, CreateBlogDto
from database import engine, SessionLocal
import models
from util import get_user_from_request
from sqlalchemy.orm import Session, joinedload

app = FastAPI()

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
async def get_blogs(db: Session = Depends(get_db)):
    blogs = db.query(models.Blog).all()
    return JSONResponse(content=jsonable_encoder(blogs))

@app.post("/create")
async def create(blog: CreateBlogDto, user: User = Depends(get_user_from_request), db: Session = Depends(get_db)):
    new_blog: models.Blog = models.Blog(
        title=blog.title,
        blog_text=blog.blog_text,
        user_id=user.id,
        date_created = datetime.now(),
        number_of_likes = 0
    )

    db.add(new_blog)
    db.commit()
    db.refresh(new_blog)

    return_blog = jsonable_encoder(new_blog)

    return JSONResponse(content=return_blog)


@app.get("/blogs/{blog_id}")
async def get_blog(blog_id: int, db: Session = Depends(get_db)):
    blog = db.query(models.Blog).options(joinedload(models.Blog.comments)).filter(models.Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    return JSONResponse(content=jsonable_encoder(blog))


@app.post("/deleteBlog/{blog_id}")
async def delete_blog(blog_id: int, db: Session = Depends(get_db)):
    blog = db.query(models.Blog).filter(models.Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    db.delete(blog)
    db.commit()

    return JSONResponse(status_code=200, content={"message": "Blog deleted successfully"})