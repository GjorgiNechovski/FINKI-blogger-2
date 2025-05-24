from datetime import datetime

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse

import zookeper
import models
from Dtos import CommentPydantic, User
from database import engine, SessionLocal
from util import get_user_from_request

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

@app.post("/create-comment")
async def create_comment(comment: CommentPydantic, user: User = Depends(get_user_from_request), db: Session = Depends(get_db)):
    blog = db.query(models.Blog).filter(models.Blog.id == comment.blog_id).first()

    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    new_comment = models.Comment(
        blog_id=comment.blog_id,
        user_id=user.id,
        comment_text=comment.comment_text,
        date_created=datetime.now()
    )

    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return JSONResponse(status_code=200, content={"message": "Comment added successfully"})

@app.post("/delete-comment")
async def delete_comment(comment_id: int, db: Session = Depends(get_db)):
    comment = db.query(models.Comment).filter(models.Comment.comment_id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    db.delete(comment)
    db.commit()

    return JSONResponse(status_code=200, content={"message": "Comment deleted successfully"})