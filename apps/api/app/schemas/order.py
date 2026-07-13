from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, model_validator


class CartItemIn(BaseModel):
    # Exactly one of the two is set — a catalog line or a custom-upload line.
    product_id: Optional[int] = None
    custom_upload_id: Optional[int] = None
    # Poster size for a product line (optional — a size-less product line
    # still prices from Product.price_inr). Meaningless for a custom line,
    # which already carries its size via the custom_upload row.
    size_code: Optional[str] = None
    qty: int = Field(gt=0, le=99)

    @model_validator(mode="after")
    def _exactly_one_line_kind(self) -> "CartItemIn":
        if (self.product_id is None) == (self.custom_upload_id is None):
            raise ValueError("Set exactly one of product_id or custom_upload_id")
        if self.custom_upload_id is not None and self.size_code is not None:
            raise ValueError("size_code is only valid for product lines")
        return self


class ShippingAddress(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    phone: str = Field(min_length=6, max_length=20)
    line1: str = Field(min_length=2, max_length=200)
    line2: str = Field(default="", max_length=200)
    city: str = Field(min_length=1, max_length=100)
    state: str = Field(min_length=1, max_length=100)
    pincode: str = Field(min_length=4, max_length=12)


class QuoteRequest(BaseModel):
    items: list[CartItemIn]


class QuoteLine(BaseModel):
    kind: str = "product"  # "product" | "custom"
    product_id: Optional[int] = None
    custom_upload_id: Optional[int] = None
    size_code: Optional[str] = None
    slug: str = ""
    title: str
    image_url: str
    price_inr: int
    qty: int
    line_total_inr: int


class QuoteResponse(BaseModel):
    lines: list[QuoteLine]
    subtotal_inr: int
    shipping_inr: int
    total_inr: int


class CheckoutRequest(BaseModel):
    email: EmailStr
    items: list[CartItemIn]
    shipping_address: ShippingAddress


class CreatePaymentResponse(BaseModel):
    order_id: int
    razorpay_order_id: Optional[str]
    razorpay_key_id: str
    amount_inr: int
    amount_paise: int
    currency: str = "INR"
    # True when Razorpay keys are not configured (local dev fallback).
    mock: bool = False


class VerifyPaymentRequest(BaseModel):
    order_id: int
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class OrderItemOut(BaseModel):
    title_snapshot: str
    slug_snapshot: str
    image_snapshot: str
    price_inr: int
    qty: int
    is_custom: bool = False
    custom_upload_id: Optional[int] = None
    size_code: Optional[str] = None

    model_config = {"from_attributes": True}


class OrderOut(BaseModel):
    id: int
    email: EmailStr
    status: str
    subtotal_inr: int
    shipping_inr: int
    total_inr: int
    shipping_address: dict
    razorpay_order_id: Optional[str]
    razorpay_payment_id: Optional[str]
    courier_name: str = ""
    tracking_number: str = ""
    paid_at: Optional[datetime] = None
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    review_note: str = ""
    reviewed_at: Optional[datetime] = None
    has_custom_items: bool = False
    created_at: datetime
    items: list[OrderItemOut]

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    status: str = Field(
        pattern="^(paid|shipped|delivered|cancelled|refunded)$"
    )
    courier_name: str = Field(default="", max_length=120)
    tracking_number: str = Field(default="", max_length=120)
