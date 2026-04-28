from fastapi import FastAPI

from core.database import create_tables
from routes import auth, products, users


app = FastAPI(title="BIA Placeholder API")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(products.router)


@app.on_event("startup")
async def on_startup():
    await create_tables()
