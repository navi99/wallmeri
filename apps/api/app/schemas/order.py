from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class CartItemIn(BaseModel):
    product_id: int
    qty: int = Field(gt=0, le=99)


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
    product_id: int
    slug: str
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
    created_at: datetime
    items: list[OrderItemOut]

    model_config = {"from_attributes": True}
