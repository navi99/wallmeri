from datetime import datetime

from pydantic import BaseModel, Field

from app.models import MAX_DISCOUNT_PERCENT


class DiscountOut(BaseModel):
    """Public view of the site-wide discount.

    percent is already zeroed when the discount is inactive, so the
    storefront has exactly one thing to check - see
    services.discount.active_discount.
    """

    percent: int = 0
    label: str = ""


class DiscountAdminOut(BaseModel):
    percent: int
    label: str
    is_active: bool
    updated_at: datetime

    model_config = {"from_attributes": True}


class DiscountUpdate(BaseModel):
    # Whole percent only: the rupee rounding in services.discount.apply is
    # integer arithmetic mirrored in the browser, and a fractional percent
    # would let the two drift apart.
    percent: int = Field(default=0, ge=0, le=MAX_DISCOUNT_PERCENT)
    label: str = Field(default="", max_length=80)
    is_active: bool = False
