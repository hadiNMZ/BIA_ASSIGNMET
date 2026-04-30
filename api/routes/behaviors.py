from typing import Annotated, Literal

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from core import schemas
from core.database import get_db_session
from core.models import Behavior
from routes.auth import get_current_user_id

router = APIRouter()


class BehaviorUpsertRequest(BaseModel):
    product_id: int
    actions: list[Literal["viewed", "clicked", "purchased"]] = Field(min_length=1)


@router.post("/behaviors", response_model=schemas.Behavior)
async def upsert_behavior(
    behavior_request: BehaviorUpsertRequest,
    current_user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """Create or update one user/product behavior row."""
    actions = set(behavior_request.actions)
    insert_values = {
        "user_id": current_user_id,
        "product_id": behavior_request.product_id,
        "viewed": "viewed" in actions,
        "clicked": "clicked" in actions,
        "purchased": "purchased" in actions,
    }
    insert_statement = insert(Behavior).values(**insert_values)
    
    # Using OR here to only convert false values to True

    # Also this makes it idempotent to one behavior can't be created twice.
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
