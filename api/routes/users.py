from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from core import schemas
from core.database import get_db_session
from core.models import User
from routes.auth import get_current_user_id

router = APIRouter(tags=["Users"])


@router.get(
    "/me",
    response_model=schemas.User,
    summary="Get current user",
    description=(
        "Returns the user record for the user ID encoded in the bearer token."
    ),
)
async def get_me(
    current_user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """Return the current fake-authenticated user."""
    user = await db.get(User, current_user_id)

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return user
