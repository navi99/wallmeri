from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class OriginalPaintingBrief(BaseModel):
    """Nested on ProductOut — just enough for the PDP to decide what CTA to show."""

    status: str
    price_inr: int

    model_config = {"from_attributes": True}


class OriginalPaintingOut(BaseModel):
    id: int
    product_id: int
    medium: str
    width_cm: Decimal
    height_cm: Decimal
    year_created: Optional[int] = None
    price_inr: int
    status: str
    story: str
    image_url: str
    # Round-tripped for the same reason as ProductOut.image_id — lets the
    # admin editor tell "no managed image" apart from "unchanged".
    image_id: Optional[int] = None

    model_config = {"from_attributes": True}


class OriginalPaintingUpsert(BaseModel):
    medium: str = Field(default="", max_length=160)
    width_cm: Decimal = Field(gt=0)
    height_cm: Decimal = Field(gt=0)
    year_created: Optional[int] = None
    price_inr: int = Field(gt=0)
    status: str = Field(default="available", pattern="^(available|reserved|sold)$")
    story: str = Field(default="", max_length=4000)
    image_id: Optional[int] = None


class InquiryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    email: EmailStr
    phone: str = Field(default="", max_length=20)
    message: str = Field(default="", max_length=4000)
    # Honeypot — bots fill it, humans never see it. Non-empty submissions are dropped.
    website: str = ""


class InquiryOut(BaseModel):
    id: int
    original_painting_id: int
    name: str
    email: EmailStr
    phone: str
    message: str
    status: str
    admin_note: str
    created_at: datetime
    product_title: str = ""
    product_slug: str = ""

    model_config = {"from_attributes": True}


class InquiryUpdate(BaseModel):
    status: Optional[str] = Field(
        default=None, pattern="^(new|contacted|negotiating|won|lost)$"
    )
    admin_note: Optional[str] = None
