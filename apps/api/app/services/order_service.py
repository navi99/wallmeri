"""Order lifecycle: idempotent payment confirmation.

Shared by the checkout verify endpoint and the Razorpay webhook so both paths
behave identically no matter which fires first.
"""
from datetime import datetime, timezone

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.models import Order, OrderStatus
from app.services import email_service


def mark_order_paid(db: Session, order: Order, payment_id: str | None) -> bool:
    """Transition a paid order out of `pending`/`failed` exactly once.
    Returns True if this call did it.

    Every product is made to order, so there is no inventory to reserve or
    decrement here — confirmation only moves the order's own state. An order
    with any custom-upload line lands in `in_review` instead of `paid` —
    admin approval (or rejection + refund) is required before it can proceed
    to fulfilment; see the custom-review endpoints in app.api.routes.admin.
    """
    # Row-lock the order so verify + webhook serialize on the same order.
    locked = db.execute(
        text("SELECT status FROM orders WHERE id = :id FOR UPDATE"),
        {"id": order.id},
    ).scalar_one()
    if locked not in (OrderStatus.pending.value, OrderStatus.failed.value):
        return False  # already paid (or beyond) — idempotent no-op

    order.status = OrderStatus.in_review if order.has_custom_items else OrderStatus.paid
    order.paid_at = datetime.now(timezone.utc)
    if payment_id:
        order.razorpay_payment_id = payment_id

    db.commit()
    db.refresh(order)
    email_service.send_order_confirmation(order)
    return True
