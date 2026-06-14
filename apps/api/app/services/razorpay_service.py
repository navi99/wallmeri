"""Thin wrapper around the Razorpay SDK.

If keys are not configured we operate in "mock" mode so the full checkout flow
can still be exercised locally without real Razorpay credentials.
"""
import hmac
import hashlib
from typing import Optional

import razorpay

from app.core.config import settings


def is_configured() -> bool:
    return bool(settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET)


def _client() -> razorpay.Client:
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


def create_order(amount_inr: int, receipt: str) -> Optional[str]:
    """Create a Razorpay order, returning its id. Returns None in mock mode."""
    if not is_configured():
        return None
    order = _client().order.create(
        {
            "amount": amount_inr * 100,  # paise
            "currency": "INR",
            "receipt": receipt,
            "payment_capture": 1,
        }
    )
    return order["id"]


def verify_signature(razorpay_order_id: str, razorpay_payment_id: str, signature: str) -> bool:
    """Verify the checkout signature using HMAC-SHA256."""
    if not is_configured():
        # Mock mode: accept the sentinel signature produced by the frontend stub.
        return signature == "mock_signature"
    message = f"{razorpay_order_id}|{razorpay_payment_id}".encode()
    expected = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode(), message, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


def verify_webhook_signature(body: bytes, signature: str) -> bool:
    if not settings.RAZORPAY_WEBHOOK_SECRET:
        return False
    expected = hmac.new(
        settings.RAZORPAY_WEBHOOK_SECRET.encode(), body, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)
