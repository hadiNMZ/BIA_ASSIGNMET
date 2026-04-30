import random
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core import schemas
from core.database import get_db_session
from core.models import Product
from routes.auth import get_current_user_id

router = APIRouter(tags=["Recommendations"])


@router.get(
    "/recommended-products",
    response_model=list[schemas.Product],
    summary="Get recommended products",
    description=(
        "Returns recommended products for the authenticated user. This is currently "
        "a placeholder that returns up to 5 random products from IDs 1 through 1000."
    ),
)
async def get_recommended_products(
    current_user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """Return 5 random products until the recommendation algorithm is ready."""
    product_ids = random.sample(range(1, 1001), 5)
    statement = select(Product).where(Product.product_id.in_(product_ids))

    return list((await db.scalars(statement)).all())
