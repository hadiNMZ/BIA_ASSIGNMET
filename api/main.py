from contextlib import asynccontextmanager

from fastapi import FastAPI

from core.import_data import import_excel_data
from routes import auth, products, users, recommend


@asynccontextmanager
async def lifespan(app: FastAPI):
    counts = await import_excel_data()
    print(f"Imported Excel data: {counts}")
    yield


app = FastAPI(title="BIA Placeholder API", lifespan=lifespan)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(products.router)
