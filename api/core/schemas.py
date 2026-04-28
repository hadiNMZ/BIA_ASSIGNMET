from pydantic import BaseModel, ConfigDict


class UserBase(BaseModel):
    age: int
    country: str


class User(UserBase):
    model_config = ConfigDict(from_attributes=True)

    user_id: int


class ProductBase(BaseModel):
    category: str
    price: int


class Product(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    product_id: int


class RatingBase(BaseModel):
    user_id: int
    product_id: int
    rating: int


class Rating(RatingBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class BehaviorBase(BaseModel):
    user_id: int
    product_id: int
    viewed: bool
    clicked: bool
    purchased: bool


class Behavior(BehaviorBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
