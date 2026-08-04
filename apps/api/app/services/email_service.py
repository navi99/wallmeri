"""Transactional email: SMTP when configured, console log otherwise.

Failures are logged and swallowed — email must never break checkout.
"""
import logging
import smtplib
from email.message import EmailMessage
from urllib.parse import quote

from app.core.config import settings
from app.models import Order

logger = logging.getLogger("wallmeri.email")


def is_configured() -> bool:
    return bool(settings.SMTP_HOST)


def _order_track_url(order: Order) -> str:
    # Guest orders (no user_id) are only viewable with a matching ?email= —
    # see the ownership check in routes/orders.py get_order — so every link
    # out to /order/{id} must carry it, or the page 403s for guest checkouts.
    base = f"{settings.PUBLIC_WEB_BASE_URL.rstrip('/')}/order/{order.id}"
    return f"{base}?email={quote(order.email)}"


def send(to: str, subject: str, text: str) -> None:
    if not is_configured():
        logger.info("EMAIL (console mode) to=%s subject=%r\n%s", to, subject, text)
        print(f"--- EMAIL (console mode) ---\nTo: {to}\nSubject: {subject}\n\n{text}\n---")
        return
    try:
        msg = EmailMessage()
        msg["From"] = settings.EMAIL_FROM
        msg["To"] = to
        msg["Subject"] = subject
        msg.set_content(text)
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as smtp:
            smtp.starttls()
            if settings.SMTP_USER:
                smtp.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            smtp.send_message(msg)
    except Exception:
        logger.exception("Failed to send email to %s (subject=%r)", to, subject)


def send_order_confirmation(order: Order) -> None:
    lines = "\n".join(
        f"  • {item.title_snapshot} × {item.qty} — ₹{item.price_inr * item.qty}"
        for item in order.items
    )
    addr = order.shipping_address or {}
    track_url = _order_track_url(order)
    review_note = (
        "\nYour order includes a custom design — we review every custom upload before "
        "printing (usually within 1-2 business days) and will email you once it's approved.\n"
        if order.has_custom_items
        else ""
    )
    body = (
        f"Hi {addr.get('full_name', '')},\n\n"
        f"Thanks for your order! We've received your payment and are getting your "
        f"metal poster{'s' if len(order.items) > 1 else ''} ready.\n"
        f"{review_note}\n"
        f"Order #{order.id}\n{lines}\n\n"
        f"  Subtotal: ₹{order.subtotal_inr}\n"
        f"  Shipping: ₹{order.shipping_inr}\n"
        f"  Total:    ₹{order.total_inr}\n\n"
        f"Shipping to:\n"
        f"  {addr.get('full_name', '')}\n"
        f"  {addr.get('line1', '')} {addr.get('line2', '')}\n"
        f"  {addr.get('city', '')}, {addr.get('state', '')} {addr.get('pincode', '')}\n\n"
        f"Track your order: {track_url}\n\n"
        f"— Team WallMeri"
    )
    send(order.email, f"WallMeri order #{order.id} confirmed", body)


def send_admin_order_notification(order: Order) -> None:
    if not settings.ADMIN_NOTIFY_EMAIL:
        return
    addr = order.shipping_address or {}
    lines = "\n".join(
        f"  • {item.title_snapshot}"
        f"{f' ({item.size_code})' if item.size_code else ''} × {item.qty} "
        f"— ₹{item.price_inr * item.qty}{'  [CUSTOM]' if item.is_custom else ''}"
        for item in order.items
    )
    track_url = _order_track_url(order)
    admin_url = f"{settings.PUBLIC_WEB_BASE_URL.rstrip('/')}/admin"
    review_flag = " [CUSTOM — NEEDS REVIEW]" if order.has_custom_items else ""
    body = (
        f"New order placed.\n\n"
        f"Order #{order.id} — {order.status.value} — {order.created_at}\n\n"
        f"Customer:\n"
        f"  {addr.get('full_name', '')}\n"
        f"  Email: {order.email}\n"
        f"  Phone: {addr.get('phone', '')}\n\n"
        f"Items:\n{lines}\n\n"
        f"  Subtotal: ₹{order.subtotal_inr}\n"
        f"  Shipping: ₹{order.shipping_inr}\n"
        f"  Total:    ₹{order.total_inr}\n\n"
        f"Shipping to:\n"
        f"  {addr.get('full_name', '')}\n"
        f"  {addr.get('line1', '')} {addr.get('line2', '')}\n"
        f"  {addr.get('city', '')}, {addr.get('state', '')} {addr.get('pincode', '')}\n\n"
        f"Payment ID: {order.razorpay_payment_id}\n\n"
        f"Order: {track_url}\n"
        f"Admin: {admin_url}\n"
    )
    send(settings.ADMIN_NOTIFY_EMAIL, f"New order #{order.id} — ₹{order.total_inr}{review_flag}", body)


def send_custom_review_approved(order: Order) -> None:
    track_url = _order_track_url(order)
    body = (
        f"Good news — your custom design on order #{order.id} passed review and is now "
        f"in production. We'll email you again once it ships.\n\n"
        f"Track your order: {track_url}\n\n"
        f"— Team WallMeri"
    )
    send(order.email, f"WallMeri order #{order.id} — custom design approved", body)


def send_custom_review_rejected(order: Order, reason: str) -> None:
    track_url = _order_track_url(order)
    body = (
        f"We're sorry — we couldn't approve the custom design on order #{order.id} for "
        f"printing.\n\n"
        f"Reason: {reason}\n\n"
        f"Your payment of ₹{order.total_inr} has been fully refunded and should reflect in "
        f"5-7 business days.\n\n"
        f"Questions? Just reply to this email.\n\n"
        f"Order: {track_url}\n\n"
        f"— Team WallMeri"
    )
    send(order.email, f"WallMeri order #{order.id} — custom design not approved", body)


def send_shipping_update(order: Order) -> None:
    track = (
        f"Courier: {order.courier_name}\nTracking number: {order.tracking_number}\n"
        if order.tracking_number
        else ""
    )
    track_url = _order_track_url(order)
    body = (
        f"Good news — your WallMeri order #{order.id} has shipped!\n\n"
        f"{track}"
        f"Track your order: {track_url}\n\n"
        f"— Team WallMeri"
    )
    send(order.email, f"WallMeri order #{order.id} has shipped", body)
