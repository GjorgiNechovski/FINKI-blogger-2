from fastapi import HTTPException, Header
import jwt
from typing import Optional

from Dtos import User

async def get_user_from_request(authorization: Optional[str] = Header(None)) -> User:
    if authorization is None:
        raise HTTPException(status_code=401, detail="Authorization header is missing")

    token = authorization.split("Bearer ")[1]
    decoded_token = jwt.decode(token, options={"verify_signature": False})

    user = User(
        id=decoded_token["nameid"],
        firstName=decoded_token["given_name"],
        lastName=decoded_token["family_name"],
        email=decoded_token["email"]
    )
    return user
