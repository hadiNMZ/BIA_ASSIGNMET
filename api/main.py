from contextlib import asynccontextmanager

from fastapi import FastAPI

from core.import_data import import_excel_data
from routes import auth, behaviors, products, users, recommend


@asynccontextmanager
async def lifespan(app: FastAPI):
    counts = await import_excel_data()
    print(f"Imported Excel data: {counts}")
    yield


app = FastAPI(
    title="BIA Placeholder API",
    description=(
        "Backend API for users, products, behavior tracking, and placeholder "
        "recommendations. Protected endpoints use a fake bearer token returned "
        "from `/login`."
    ),
    openapi_tags=[
        {
            "name": "Authentication",
            "description": "Fake login flow used to get bearer tokens for protected endpoints.",
        },
        {
            "name": "Users",
            "description": "Endpoints for the currently authenticated user.",
        },
        {
            "name": "Products",
            "description": "Product browsing, filtering, sorting, and lookup.",
        },
        {
            "name": "Recommendations",
            "description": "Recommendation endpoints. Currently backed by placeholder logic.",
        },
        {
            "name": "Behaviors",
            "description": "Record product interactions for the authenticated user.",
        },
    ],
    lifespan=lifespan,
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(products.router)
app.include_router(recommend.router)
app.include_router(behaviors.router)
