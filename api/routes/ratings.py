from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core import schemas
from core.database import get_db_session
from core.models import Product, Rating
from routes.auth import get_current_user_id

router = APIRouter(tags=["Ratings"])


class RatingUpsertRequest(BaseModel):
    product_id: int = Field(description="Product that the authenticated user rated.")
    rating: int = Field(ge=1, le=5, description="Rating value from 1 through 5.")


@router.get(
    "/ratings/{product_id}",
    response_model=schemas.Rating | None,
    summary="Get my product rating",
)
async def get_rating(
    product_id: Annotated[int, Path(description="Product ID to fetch a rating for.")],
    current_user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """Return the latest rating for the current user and product, if one exists."""
    statement = (
        select(Rating)
        .where(Rating.user_id == current_user_id, Rating.product_id == product_id)
        .order_by(Rating.id.desc())
        .limit(1)
    )
    return (await db.scalars(statement)).first()


@router.post(
    "/ratings",
    response_model=schemas.Rating,
    summary="Create or update my product rating",
)
async def upsert_rating(
    rating_request: RatingUpsertRequest,
    current_user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """Create a rating or update the current user's latest rating for a product."""
    product = await db.get(Product, rating_request.product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    statement = (
        select(Rating)
        .where(
            Rating.user_id == current_user_id,
            Rating.product_id == rating_request.product_id,
        )
        .order_by(Rating.id.desc())
        .limit(1)
    )
    rating = (await db.scalars(statement)).first()

    if rating is None:
        rating = Rating(
            user_id=current_user_id,
            product_id=rating_request.product_id,
            rating=rating_request.rating,
        )
        db.add(rating)
    else:
        rating.rating = rating_request.rating

    await db.commit()
    await db.refresh(rating)

    return rating
