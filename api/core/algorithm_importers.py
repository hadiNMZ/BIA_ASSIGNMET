from dataclasses import dataclass
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker

from core.database import async_session
from core.models import Behavior, Product, Rating, User


Record = dict[str, Any]


@dataclass(frozen=True)
class AlgorithmData:
    users: list[Record]
    products: list[Record]
    ratings: list[Record]
    behaviors: list[Record]

    @property
    def all_product_ids(self) -> list[int]:
        return [product["product_id"] for product in self.products]


class AlgorithmDataImporter:
    def __init__(self, session_factory: async_sessionmaker = async_session):
        self.session_factory = session_factory

    async def get_users(self) -> list[Record]:
        async with self.session_factory() as session:
            result = await session.execute(select(User).order_by(User.user_id))
            return [
                {
                    "user_id": user.user_id,
                    "age": user.age,
                    "country": user.country,
                }
                for user in result.scalars()
            ]

    async def get_products(self) -> list[Record]:
        async with self.session_factory() as session:
            result = await session.execute(select(Product).order_by(Product.product_id))
            return [
                {
                    "product_id": product.product_id,
                    "category": product.category,
                    "price": product.price,
                }
                for product in result.scalars()
            ]

    async def get_ratings(self) -> list[Record]:
        async with self.session_factory() as session:
            result = await session.execute(select(Rating).order_by(Rating.id))
            return [
                {
                    "id": rating.id,
                    "user_id": rating.user_id,
                    "product_id": rating.product_id,
                    "rating": rating.rating,
                }
                for rating in result.scalars()
            ]

    async def get_behaviors(self) -> list[Record]:
        async with self.session_factory() as session:
            result = await session.execute(select(Behavior).order_by(Behavior.id))
            return [
                {
                    "id": behavior.id,
                    "user_id": behavior.user_id,
                    "product_id": behavior.product_id,
                    "viewed": behavior.viewed,
                    "clicked": behavior.clicked,
                    "purchased": behavior.purchased,
                }
                for behavior in result.scalars()
            ]

    async def get_all_product_ids(self) -> list[int]:
        async with self.session_factory() as session:
            result = await session.execute(select(Product.product_id).order_by(Product.product_id))
            return list(result.scalars())

    async def load(self) -> AlgorithmData:
        return AlgorithmData(
            users=await self.get_users(),
            products=await self.get_products(),
            ratings=await self.get_ratings(),
            behaviors=await self.get_behaviors(),
        )
