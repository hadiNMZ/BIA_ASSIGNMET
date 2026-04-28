from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.post("/login", status_code=501)
async def login():
    """Placeholder login endpoint."""
    raise HTTPException(status_code=501, detail="Login is not implemented yet.")
