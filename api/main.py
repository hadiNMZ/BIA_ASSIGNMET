from fastapi import FastAPI

from core.database import create_tables
from routes import auth, products, users

async def lifespan(app):
    await create_tables()
    print("Created the tables.")
    yield

app = FastAPI(title="BIA Placeholder API", lifespan=lifespan)



app.include_router(auth.router)
app.include_router(users.router)
app.include_router(products.router)
