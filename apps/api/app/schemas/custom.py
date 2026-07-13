from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.order import OrderItemOut


class PosterSizeOut(BaseModel):
    id: int
    code: str
    label: str
    width_cm: float
    height_cm: float
    price_inr: int
    delta_inr: int
    is_enabled: bool
    position: int

    model_config = {"from_attributes": True}


class PosterSizeCreate(BaseModel):
    code: str = Field(min_length=1, max_length=20)
    label: str = Field(min_length=1, max_length=80)
    width_cm: float = Field(gt=0)
    height_cm: float = Field(gt=0)
    price_inr: int = Field(gt=0)
    delta_inr: int = 0
    is_enabled: bool = False
    position: int = 0


class PosterSizeUpdate(BaseModel):
    label: Optional[str] = Field(default=None, min_length=1, max_length=80)
    width_cm: Optional[float] = Field(default=None, gt=0)
    height_cm: Optional[float] = Field(default=None, gt=0)
    price_inr: Optional[int] = Field(default=None, gt=0)
    delta_inr: Optional[int] = None
    is_enabled: Optional[bool] = None
    position: Optional[int] = None


class CropRect(BaseModel):
    x: int = Field(ge=0)
    y: int = Field(ge=0)
    width: int = Field(gt=0)
    height: int = Field(gt=0)


class CustomItemCreate(BaseModel):
    media_id: int
    size_code: str
    orientation: str = Field(pattern="^(portrait|landscape)$")
    crop: CropRect


class CustomItemOut(BaseModel):
    custom_upload_id: int
    preview_url: str
    size_code: str
    size_label: str
    orientation: str
    price_inr: int
    dpi: int
    dpi_band: str  # "ok" | "warning" | "blocked" — see custom_upload_service.dpi_band


# ── Admin moderation queue ──────────────────────────────────────────────────

class CustomReviewLineOut(BaseModel):
    order_item_id: int
    custom_upload_id: int
    title: str
    preview_url: str
    size_code: str
    orientation: str
    dpi: int
    dpi_band: str
    crop: CropRect
    qty: int
    price_inr: int


class CustomReviewOrderOut(BaseModel):
    id: int
    email: str
    status: str
    total_inr: int
    created_at: datetime
    shipping_address: dict
    custom_lines: list[CustomReviewLineOut]
    other_lines: list[OrderItemOut] = []


class CustomReviewAction(BaseModel):
    action: str = Field(pattern="^(approve|reject)$")
    note: str = Field(default="", max_length=500)
