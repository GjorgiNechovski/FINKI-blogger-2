from sqlalchemy import Column, Integer, String, func, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from database import Base


class Blog(Base):
    __tablename__ = 'blogs'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    title = Column(String, index=True)
    blog_text = Column(String)
    date_created = Column(DateTime(timezone=True), server_default=func.now())
    number_of_likes = Column(Integer, default=0)

    comments = relationship('Comment', back_populates='blog')
    likes = relationship('Like', back_populates='blog')


class Comment(Base):
    __tablename__ = 'comments'

    comment_id = Column(Integer, primary_key=True, index=True)
    blog_id = Column(Integer, ForeignKey('blogs.id'), index=True)
    user_id = Column(String, index=True)
    comment_text = Column(String)
    date_created = Column(DateTime(timezone=True), server_default=func.now())

    blog = relationship('Blog', back_populates='comments')


class Like(Base):
    __tablename__ = 'likes'

    like_id = Column(Integer, primary_key=True, index=True)
    blog_id = Column(Integer, ForeignKey('blogs.id'), index=True)
    user_id = Column(String, index=True)

    blog = relationship('Blog', back_populates='likes')