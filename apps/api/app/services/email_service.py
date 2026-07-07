"""Transactional email: SMTP when configured, console log otherwise.

Failures are logged and swallowed — email must never break checkout.
"""
import logging
import smtplib
from email.message import EmailMessage

from app.core.config import settings
from app.models import Order

logger = logging.getLogger("wallmeri.email")


def is_configured() -> bool:
    return bool(settings.SMTP_HOST)


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
    track_url = f"{settings.PUBLIC_WEB_BASE_URL.rstrip('/')}/order/{order.id}"
    body = (
        f"Hi {addr.get('full_name', '')},\n\n"
        f"Thanks for your order! We've received your payment and are getting your "
        f"metal poster{'s' if len(order.items) > 1 else ''} ready.\n\n"
        f"Order #{order.id}\n{lines}\n\n"
        f"  Subtotal: ₹{order.subtotal_inr}\n"
        f"  Shipping: ₹{order.shipping_inr}\n"
        f"  Total:    ₹{order.total_inr}\n\n"
        f"Shipping to:\n"
        f"  {addr.get('full_name', '')}\n"
        f"  {addr.get('line1', '')} {addr.get('line2', '')}\n"
        f"  {addr.get('city', '')}, {addr.get('state', '')} {addr.get('pincode', '')}\n\n"
        f"Track your order: {track_url}\n\n"
        f"— Team Wallmeri"
    )
    send(order.email, f"Wallmeri order #{order.id} confirmed", body)


def send_shipping_update(order: Order) -> None:
    track = (
        f"Courier: {order.courier_name}\nTracking number: {order.tracking_number}\n"
        if order.tracking_number
        else ""
    )
    track_url = f"{settings.PUBLIC_WEB_BASE_URL.rstrip('/')}/order/{order.id}"
    body = (
        f"Good news — your Wallmeri order #{order.id} has shipped!\n\n"
        f"{track}"
        f"Track your order: {track_url}\n\n"
        f"— Team Wallmeri"
    )
    send(order.email, f"Wallmeri order #{order.id} has shipped", body)
