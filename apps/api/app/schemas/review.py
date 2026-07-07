from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    title: str = Field(default="", max_length=200)
    body: str = Field(default="", max_length=4000)


class ReviewOut(BaseModel):
    id: int
    rating: int
    title: str
    body: str
    author_name: str = ""
    created_at: datetime

    model_config = {"from_attributes": True}


class MyReviewOut(ReviewOut):
    status: str
    reject_reason: str


class ReviewEligibility(BaseModel):
    can_review: bool
    reason: str = ""  # "not_purchased" | "not_delivered" | "already_reviewed" | ""
    my_review: Optional[MyReviewOut] = None


class ReviewAdminOut(BaseModel):
    id: int
    product_id: int
    product_title: str = ""
    product_slug: str = ""
    author_name: str = ""
    author_email: str = ""
    rating: int
    title: str
    body: str
    status: str
    reject_reason: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ReviewModerate(BaseModel):
    status: str = Field(pattern="^(approved|rejected)$")
    reject_reason: str = Field(default="", max_length=500)
