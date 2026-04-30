from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core import schemas
from core.database import get_db_session
from core.models import Product
from routes.auth import get_current_user_id

router = APIRouter()


class ProductListResponse(BaseModel):
    items: list[schemas.Product]
    page: int
    page_size: int


@router.get("/products", response_model=ProductListResponse)
async def get_products(
    current_user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
    category: str | None = None,
    price_sort: Literal["asc", "desc"] | None = None,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
):
    """Return products with optional category filtering and pagination."""
    statement = select(Product)

    if category:
        statement = statement.where(Product.category == category)

    if price_sort == "asc":
        statement = statement.order_by(Product.price.asc(), Product.product_id)
    elif price_sort == "desc":
        statement = statement.order_by(Product.price.desc(), Product.product_id)
    else:
        statement = statement.order_by(Product.product_id)

    statement = statement.offset((page - 1) * page_size).limit(page_size)
    products = (await db.scalars(statement)).all()

    return ProductListResponse(items=products, page=page, page_size=page_size)


@router.get("/products/categories", response_model=list[str])
async def get_product_categories(
    current_user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """Return all available product categories."""
    statement = select(Product.category).distinct().order_by(Product.category)
    return list((await db.scalars(statement)).all())


@router.get("/products/{product_id}", response_model=schemas.Product)
async def get_product(
    product_id: int,
    current_user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """Return one product by ID."""
    product = await db.get(Product, product_id)

    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    return product
