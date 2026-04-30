import secrets

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field

router = APIRouter(tags=["Authentication"])
bearer_scheme = HTTPBearer()


class LoginRequest(BaseModel):
    user_id: int = Field(
        description="User ID to encode into the fake bearer token.",
        examples=[1],
    )
    password: str = Field(
        description="Accepted but not validated. This API intentionally uses fake auth.",
        examples=["password"],
    )


class LoginResponse(BaseModel):
    token: str = Field(
        description="Fake bearer token in the format '<user_id>_<random_chars>'.",
        examples=["1_x5qJf7WpQaR9ZQm2WR6pTw"],
    )
    token_type: str = Field(
        default="bearer",
        description="Token type to use in the Authorization header.",
        examples=["bearer"],
    )


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> int:
    """Extract the user_id part from the fake auth token."""
    token = credentials.credentials
    user_id, separator, random_part = token.partition("_")

    if not user_id or not separator or not random_part:
        raise HTTPException(status_code=401, detail="Invalid token")

    try:
        return int(user_id)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Create a fake login token",
    description=(
        "Returns a fake bearer token for the supplied user ID. The password is "
        "accepted for frontend flow compatibility, but it is not checked."
    ),
)
async def login(login_request: LoginRequest):
    """Return a fake token for the provided user_id."""
    random_chars = secrets.token_urlsafe(16)
    return LoginResponse(token=f"{login_request.user_id}_{random_chars}")
