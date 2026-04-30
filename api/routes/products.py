from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Path, Query
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core import schemas
from core.database import get_db_session
from core.models import Product
from routes.auth import get_current_user_id

router = APIRouter(tags=["Products"])


class ProductListResponse(BaseModel):
    items: list[schemas.Product] = Field(description="Products in this page.")
    page: int = Field(description="Current page number.")
    page_size: int = Field(description="Maximum number of products per page.")


@router.get(
    "/products",
    response_model=ProductListResponse,
    summary="List products",
    description=(
        "Returns products visible to the authenticated user. Supports category "
        "filtering, price sorting, and page-based pagination."
    ),
)
async def get_products(
    current_user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
    category: Annotated[
        str | None,
        Query(description="Optional exact category filter.", examples=["electronics"]),
    ] = None,
    price_sort: Annotated[
        Literal["asc", "desc"] | None,
        Query(description="Optional price sort direction."),
    ] = None,
    page: Annotated[int, Query(ge=1, description="Page number, starting at 1.")] = 1,
    page_size: Annotated[
        int,
        Query(ge=1, le=100, description="Number of products per page. Maximum is 100."),
    ] = 20,
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


@router.get(
    "/products/categories",
    response_model=list[str],
    summary="List product categories",
    description="Returns all distinct product categories sorted alphabetically.",
)
async def get_product_categories(
    current_user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """Return all available product categories."""
    statement = select(Product.category).distinct().order_by(Product.category)
    return list((await db.scalars(statement)).all())


@router.get(
    "/products/{product_id}",
    response_model=schemas.Product,
    summary="Get a product",
    description="Returns one product by ID, or 404 if the product does not exist.",
)
async def get_product(
    product_id: Annotated[
        int,
        Path(description="Product ID to fetch.", examples=[42]),
    ],
    current_user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """Return one product by ID."""
    product = await db.get(Product, product_id)

    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    return product
