import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "../../algorithm"))

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core import schemas
from core.database import get_db_session
from core.models import Product
from core.algorithm_importers import AlgorithmDataImporter
from routes.auth import get_current_user_id

from algorithm.genetic_algo import genetic_algorithm, compute_score_matrix

router = APIRouter(tags=["Recommendations"])


@router.get(
    "/recommended-products",
    response_model=schemas.RecommendationResponse,
    summary="Get recommended products",
    description=(
        "Returns 5 personalized product recommendations for the authenticated user "
        "using a Genetic Algorithm. The GA runs 80 generations to find the best "
        "combination of products based on the user's ratings and behavior history."
    ),
)
async def get_recommended_products(
    current_user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    importer = AlgorithmDataImporter()
    data = await importer.load()

    score_matrix = compute_score_matrix(data.ratings, data.behaviors)

    best_chromosome, best_score, history = genetic_algorithm(
        user_id         = current_user_id,
        score_matrix    = score_matrix,
        all_product_ids = data.all_product_ids
    )

    result = await db.execute(
        select(Product).where(Product.product_id.in_(best_chromosome))
    )
    recommended_products = list(result.scalars().all())

    return schemas.RecommendationResponse(
        products        = recommended_products,
        fitness_score   = round(best_score, 3),
        fitness_history = [round(v, 3) for v in history]
    )
