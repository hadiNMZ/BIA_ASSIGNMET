import random
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core import schemas
from core.models import Product
from routes.auth import get_current_user_id
from routes.products import get_db_session

router = APIRouter()


@router.get("/recommended-products", response_model=list[schemas.Product])
async def get_recommended_products(
    current_user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """Return 5 random products until the recommendation algorithm is ready."""
    product_ids = random.sample(range(1, 1001), 5)
    statement = select(Product).where(Product.product_id.in_(product_ids))

    return list((await db.scalars(statement)).all())
