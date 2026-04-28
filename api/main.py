from fastapi import FastAPI

from routes import auth, products, users


app = FastAPI(title="BIA Placeholder API")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(products.router)
