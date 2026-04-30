import secrets

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel

router = APIRouter()
bearer_scheme = HTTPBearer()


class LoginRequest(BaseModel):
    user_id: int
    password: str


class LoginResponse(BaseModel):
    token: str
    token_type: str = "bearer"


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> str:
    """Extract the user_id part from the fake auth token."""
    token = credentials.credentials
    user_id, separator, random_part = token.partition("_")

    if not user_id or not separator or not random_part:
        raise HTTPException(status_code=401, detail="Invalid token")

    return user_id


@router.post("/login", response_model=LoginResponse)
async def login(login_request: LoginRequest):
    """Return a fake token for the provided user_id."""
    random_chars = secrets.token_urlsafe(16)
    return LoginResponse(token=f"{login_request.user_id}_{random_chars}")
