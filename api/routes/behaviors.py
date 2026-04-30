from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, model_validator
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from core import schemas
from core.database import get_db_session
from core.models import Behavior
from routes.auth import get_current_user_id

router = APIRouter()


class BehaviorUpsertRequest(BaseModel):
    user_id: int
    product_id: int
    viewed: bool | None = None
    clicked: bool | None = None
    purchased: bool | None = None

    @model_validator(mode="after")
    def require_behavior_type(self):
        if self.viewed is None and self.clicked is None and self.purchased is None:
            raise ValueError("At least one behavior type is required")

        return self


@router.post("/behaviors", response_model=schemas.Behavior)
async def upsert_behavior(
    behavior_request: BehaviorUpsertRequest,
    current_user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """Create or update one user/product behavior row."""
    if behavior_request.user_id != current_user_id:
        raise HTTPException(
            status_code=403,
            detail="Cannot create behavior for another user",
        )

    insert_values = {
        "user_id": behavior_request.user_id,
        "product_id": behavior_request.product_id,
        "viewed": behavior_request.viewed or False,
        "clicked": behavior_request.clicked or False,
        "purchased": behavior_request.purchased or False,
    }
    insert_statement = insert(Behavior).values(**insert_values)
    update_values = {
        "viewed": Behavior.viewed | insert_statement.excluded.viewed,
        "clicked": Behavior.clicked | insert_statement.excluded.clicked,
        "purchased": Behavior.purchased | insert_statement.excluded.purchased,
    }

    statement = insert_statement.on_conflict_do_update(
        index_elements=[Behavior.user_id, Behavior.product_id],
        set_=update_values,
    ).returning(Behavior)

    behavior = (await db.scalars(statement)).one()
    await db.commit()

    return behavior
