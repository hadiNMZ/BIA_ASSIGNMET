from pydantic import BaseModel, ConfigDict, Field


class UserBase(BaseModel):
    age: int = Field(description="User age.")
    country: str = Field(description="User country.")


class User(UserBase):
    model_config = ConfigDict(from_attributes=True)

    user_id: int = Field(description="Unique user identifier.")


class ProductBase(BaseModel):
    category: str = Field(description="Product category used for filtering.")
    price: int = Field(description="Product price.")


class Product(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    product_id: int = Field(description="Unique product identifier.")


class RatingBase(BaseModel):
    user_id: int = Field(description="User who created the rating.")
    product_id: int = Field(description="Product that was rated.")
    rating: int = Field(description="Rating value.")


class Rating(RatingBase):
    model_config = ConfigDict(from_attributes=True)

    id: int = Field(description="Unique rating row identifier.")


class BehaviorBase(BaseModel):
    user_id: int = Field(description="User who performed the behavior.")
    product_id: int = Field(description="Product the behavior belongs to.")
    viewed: bool = Field(description="Whether the user viewed the product.")
    clicked: bool = Field(description="Whether the user clicked the product.")
    purchased: bool = Field(description="Whether the user purchased the product.")


class Behavior(BehaviorBase):
    model_config = ConfigDict(from_attributes=True)

    id: int = Field(description="Unique behavior row identifier.")
