from sqlalchemy import Boolean, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


class User(Base):
    __tablename__ = "users"

    user_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    age: Mapped[int] = mapped_column(Integer)
    country: Mapped[str] = mapped_column(String(100))

    ratings: Mapped[list["Rating"]] = relationship(back_populates="user")
    behaviors: Mapped[list["Behavior"]] = relationship(back_populates="user")


class Product(Base):
    __tablename__ = "products"

    product_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    category: Mapped[str] = mapped_column(String(100))
    price: Mapped[int] = mapped_column(Integer)

    ratings: Mapped[list["Rating"]] = relationship(back_populates="product")
    behaviors: Mapped[list["Behavior"]] = relationship(back_populates="product")


class Rating(Base):
    __tablename__ = "ratings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"), index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.product_id"), index=True)
    rating: Mapped[int] = mapped_column(Integer)

    user: Mapped[User] = relationship(back_populates="ratings")
    product: Mapped[Product] = relationship(back_populates="ratings")


class Behavior(Base):
    __tablename__ = "behaviors"
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "product_id",
            name="uq_behaviors_user_id_product_id",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"), index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.product_id"), index=True)
    viewed: Mapped[bool] = mapped_column(Boolean)
    clicked: Mapped[bool] = mapped_column(Boolean)
    purchased: Mapped[bool] = mapped_column(Boolean)

    user: Mapped[User] = relationship(back_populates="behaviors")
    product: Mapped[Product] = relationship(back_populates="behaviors")
