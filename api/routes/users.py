from fastapi import APIRouter

router = APIRouter()


@router.get("/me")
async def get_me():
    """Return a placeholder current user."""
    return {
        "id": "placeholder-user-id",
        "name": "Placeholder User",
        "email": "placeholder@example.com",
    }
