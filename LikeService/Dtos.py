from pydantic import BaseModel


class User(BaseModel):
    userName: str
    firstName: str
    lastName: str
    email: str
