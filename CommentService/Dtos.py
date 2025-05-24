from pydantic import BaseModel


class User(BaseModel):
    id: str
    firstName: str
    lastName: str
    email: str

class CommentPydantic(BaseModel):
    blog_id: int
    comment_text: str