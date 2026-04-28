from fastapi import APIRouter

router = APIRouter()


@router.get("/products")
async def get_products():
    """Return placeholder products."""
    return [
        {
            "id": "placeholder-product-1",
            "name": "Placeholder Product 1",
            "price": 0,
        },
        {
            "id": "placeholder-product-2",
            "name": "Placeholder Product 2",
            "price": 0,
        },
    ]


@router.get("/products/{product_id}")
async def get_product(product_id: str):
    """Return one placeholder product."""
    return {
        "id": product_id,
        "name": "Placeholder Product",
        "price": 0,
    }
