from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_optional_user
from app.models import Order, OrderItem, OrderStatus, Product, User
from app.schemas.order import (
    CheckoutRequest,
    CreatePaymentResponse,
    QuoteRequest,
    QuoteResponse,
    VerifyPaymentRequest,
)
from app.services import razorpay_service
from app.services.pricing import compute_quote

router = APIRouter(tags=["checkout"])


@router.post("/checkout/quote", response_model=QuoteResponse)
def quote(payload: QuoteRequest, db: Session = Depends(get_db)):
    try:
        lines, subtotal, shipping, total = compute_quote(db, payload.items)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    return QuoteResponse(
        lines=lines, subtotal_inr=subtotal, shipping_inr=shipping, total_inr=total
    )


@router.post("/checkout/create-payment", response_model=CreatePaymentResponse)
def create_payment(
    payload: CheckoutRequest,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_optional_user),
):
    try:
        lines, subtotal, shipping, total = compute_quote(db, payload.items)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    order = Order(
        user_id=user.id if user else None,
        email=payload.email.lower(),
        status=OrderStatus.pending,
        subtotal_inr=subtotal,
        shipping_inr=shipping,
        total_inr=total,
        shipping_address=payload.shipping_address.model_dump(),
    )
    for line in lines:
        order.items.append(
            OrderItem(
                product_id=line.product_id,
                title_snapshot=line.title,
                slug_snapshot=line.slug,
                image_snapshot=line.image_url,
                price_inr=line.price_inr,
                qty=line.qty,
            )
        )
    db.add(order)
    db.flush()  # assign order.id

    rzp_order_id = razorpay_service.create_order(total, receipt=f"wallmeri_{order.id}")
    order.razorpay_order_id = rzp_order_id
    db.commit()
    db.refresh(order)

    return CreatePaymentResponse(
        order_id=order.id,
        razorpay_order_id=rzp_order_id,
        razorpay_key_id=settings.RAZORPAY_KEY_ID,
        amount_inr=total,
        amount_paise=total * 100,
        mock=not razorpay_service.is_configured(),
    )


@router.post("/checkout/verify")
def verify_payment(payload: VerifyPaymentRequest, db: Session = Depends(get_db)):
    order = db.get(Order, payload.order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    if not razorpay_service.verify_signature(
        payload.razorpay_order_id, payload.razorpay_payment_id, payload.razorpay_signature
    ):
        order.status = OrderStatus.failed
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Payment signature verification failed"
        )

    order.status = OrderStatus.paid
    order.razorpay_payment_id = payload.razorpay_payment_id

    # Decrement stock now that payment is confirmed.
    for item in order.items:
        if item.product_id:
            product = db.get(Product, item.product_id)
            if product:
                product.stock = max(0, product.stock - item.qty)

    db.commit()
    return {"status": "paid", "order_id": order.id}


@router.post("/checkout/webhook")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")
    if not razorpay_service.verify_webhook_signature(body, signature):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid webhook signature")

    payload = await request.json()
    event = payload.get("event", "")
    if event in ("payment.captured", "order.paid"):
        entity = (
            payload.get("payload", {})
            .get("payment", {})
            .get("entity", {})
        )
        rzp_order_id = entity.get("order_id")
        if rzp_order_id:
            order = (
                db.query(Order).filter(Order.razorpay_order_id == rzp_order_id).first()
            )
            if order and order.status != OrderStatus.paid:
                order.status = OrderStatus.paid
                order.razorpay_payment_id = entity.get("id")
                db.commit()
    return {"ok": True}
