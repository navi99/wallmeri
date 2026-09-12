"""Transactional email: SMTP when configured, console log otherwise.

Failures are logged and swallowed - email must never break checkout.
"""
import logging
import smtplib
from email.message import EmailMessage
from urllib.parse import quote

from app.core.config import settings
from app.models import ContactEnquiry, Order

logger = logging.getLogger("wallmeri.email")


def is_configured() -> bool:
    return bool(settings.SMTP_HOST)


def _order_track_url(order: Order) -> str:
    # Guest orders (no user_id) are only viewable with a matching ?email= -
    # see the ownership check in routes/orders.py get_order - so every link
    # out to /order/{id} must carry it, or the page 403s for guest checkouts.
    base = f"{settings.PUBLIC_WEB_BASE_URL.rstrip('/')}/order/{order.id}"
    return f"{base}?email={quote(order.email)}"


def send(to: str, subject: str, text: str, reply_to: str = "") -> None:
    """Sends one plain-text mail.

    reply_to lets a notification sent *from* the no-reply address still be
    answerable: the contact-form notification sets it to the customer, so
    hitting Reply in the team inbox reaches them and not EMAIL_FROM.
    """
    if not is_configured():
        logger.info("EMAIL (console mode) to=%s subject=%r\n%s", to, subject, text)
        print(f"--- EMAIL (console mode) ---\nTo: {to}\nSubject: {subject}\n\n{text}\n---")
        return
    try:
        msg = EmailMessage()
        msg["From"] = settings.EMAIL_FROM
        msg["To"] = to
        msg["Subject"] = subject
        if reply_to:
            msg["Reply-To"] = reply_to
        msg.set_content(text)
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as smtp:
            smtp.starttls()
            if settings.SMTP_USER:
                smtp.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            smtp.send_message(msg)
    except Exception:
        logger.exception("Failed to send email to %s (subject=%r)", to, subject)


def _discount_note(order: Order) -> str:
    """A single saving line, or "" when the order was placed at list price.

    The item lines and Subtotal above it are already the discounted figures
    (OrderItem.price_inr stores what was actually charged), so this reports
    the saving rather than restating the arithmetic - and pre-discount
    orders, which carry discount_percent 0, render exactly as they always did.
    """
    saved = order.original_subtotal_inr - order.subtotal_inr
    if order.discount_percent <= 0 or saved <= 0:
        return ""
    occasion = f"{order.discount_label} " if order.discount_label else ""
    return f"  ({occasion}{order.discount_percent}% off - you saved ₹{saved})\n"


def send_order_confirmation(order: Order) -> None:
    lines = "\n".join(
        f"  • {item.title_snapshot} × {item.qty} - ₹{item.price_inr * item.qty}"
        for item in order.items
    )
    addr = order.shipping_address or {}
    track_url = _order_track_url(order)
    review_note = (
        "\nYour order includes a custom design - we review every custom upload before "
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
        f"  Total:    ₹{order.total_inr}\n"
        f"{_discount_note(order)}\n"
        f"Shipping to:\n"
        f"  {addr.get('full_name', '')}\n"
        f"  {addr.get('line1', '')} {addr.get('line2', '')}\n"
        f"  {addr.get('city', '')}, {addr.get('state', '')} {addr.get('pincode', '')}\n\n"
        f"Track your order: {track_url}\n\n"
        f"- Team WallMeri"
    )
    send(order.email, f"WallMeri order #{order.id} confirmed", body)


def send_admin_order_notification(order: Order) -> None:
    if not settings.ADMIN_NOTIFY_EMAIL:
        return
    addr = order.shipping_address or {}
    lines = "\n".join(
        f"  • {item.title_snapshot}"
        f"{f' ({item.size_code})' if item.size_code else ''} × {item.qty} "
        f"- ₹{item.price_inr * item.qty}{'  [CUSTOM]' if item.is_custom else ''}"
        for item in order.items
    )
    track_url = _order_track_url(order)
    admin_url = f"{settings.PUBLIC_WEB_BASE_URL.rstrip('/')}/admin"
    review_flag = " [CUSTOM - NEEDS REVIEW]" if order.has_custom_items else ""
    body = (
        f"New order placed.\n\n"
        f"Order #{order.id} - {order.status.value} - {order.created_at}\n\n"
        f"Customer:\n"
        f"  {addr.get('full_name', '')}\n"
        f"  Email: {order.email}\n"
        f"  Phone: {addr.get('phone', '')}\n\n"
        f"Items:\n{lines}\n\n"
        f"  Subtotal: ₹{order.subtotal_inr}\n"
        f"  Shipping: ₹{order.shipping_inr}\n"
        f"  Total:    ₹{order.total_inr}\n"
        f"{_discount_note(order)}\n"
        f"Shipping to:\n"
        f"  {addr.get('full_name', '')}\n"
        f"  {addr.get('line1', '')} {addr.get('line2', '')}\n"
        f"  {addr.get('city', '')}, {addr.get('state', '')} {addr.get('pincode', '')}\n\n"
        f"Payment ID: {order.razorpay_payment_id}\n\n"
        f"Order: {track_url}\n"
        f"Admin: {admin_url}\n"
    )
    send(settings.ADMIN_NOTIFY_EMAIL, f"New order #{order.id} - ₹{order.total_inr}{review_flag}", body)


def send_custom_review_approved(order: Order) -> None:
    track_url = _order_track_url(order)
    body = (
        f"Good news - your custom design on order #{order.id} passed review and is now "
        f"in production. We'll email you again once it ships.\n\n"
        f"Track your order: {track_url}\n\n"
        f"- Team WallMeri"
    )
    send(order.email, f"WallMeri order #{order.id} - custom design approved", body)


def send_custom_review_rejected(order: Order, reason: str) -> None:
    track_url = _order_track_url(order)
    body = (
        f"We're sorry - we couldn't approve the custom design on order #{order.id} for "
        f"printing.\n\n"
        f"Reason: {reason}\n\n"
        f"Your payment of ₹{order.total_inr} has been fully refunded and should reflect in "
        f"5-7 business days.\n\n"
        f"Questions? Just reply to this email.\n\n"
        f"Order: {track_url}\n\n"
        f"- Team WallMeri"
    )
    send(order.email, f"WallMeri order #{order.id} - custom design not approved", body)


def send_shipping_update(order: Order) -> None:
    track = (
        f"Courier: {order.courier_name}\nTracking number: {order.tracking_number}\n"
        if order.tracking_number
        else ""
    )
    track_url = _order_track_url(order)
    body = (
        f"Good news - your WallMeri order #{order.id} has shipped!\n\n"
        f"{track}"
        f"Track your order: {track_url}\n\n"
        f"- Team WallMeri"
    )
    send(order.email, f"WallMeri order #{order.id} has shipped", body)


# Labels for the contact form's category codes (see
# schemas/contact.CATEGORY_PATTERN). Kept here so subject lines read like a
# human wrote them rather than leaking the raw code into the team's inbox.
CONTACT_CATEGORY_LABELS = {
    "order": "Order status",
    "product": "Product question",
    "returns": "Returns & replacements",
    "wholesale": "Bulk & corporate",
    "artist": "Artist enquiry",
    "general": "General",
}


def _contact_category_label(category: str) -> str:
    return CONTACT_CATEGORY_LABELS.get(category, category or "General")


def send_contact_enquiry_notification(enquiry: ContactEnquiry) -> None:
    """Tells the team a message came in.

    Reply-To is the customer, so the team can answer straight from the inbox
    instead of copying the address out of the body.
    """
    if not settings.ADMIN_NOTIFY_EMAIL:
        return
    label = _contact_category_label(enquiry.category)
    admin_url = f"{settings.PUBLIC_WEB_BASE_URL.rstrip('/')}/admin"
    body = (
        f"New enquiry from the contact form.\n\n"
        f"Category: {label}\n"
        f"Subject:  {enquiry.subject or '(none)'}\n"
        f"Received: {enquiry.created_at}\n\n"
        f"From:\n"
        f"  {enquiry.name}\n"
        f"  Email: {enquiry.email}\n"
        f"  Phone: {enquiry.phone or '(not given)'}\n\n"
        f"Message:\n{enquiry.message}\n\n"
        f"Reply to this email to answer {enquiry.name} directly.\n"
        f"Admin: {admin_url}\n"
    )
    send(
        settings.ADMIN_NOTIFY_EMAIL,
        f"New enquiry [{label}] - {enquiry.subject or enquiry.name}",
        body,
        reply_to=enquiry.email,
    )


def send_contact_enquiry_ack(enquiry: ContactEnquiry) -> None:
    """Confirms receipt to the customer and puts the response window in
    writing, matching what the contact page promises on screen."""
    subject_line = f"  {enquiry.subject}\n" if enquiry.subject else ""
    body = (
        f"Hi {enquiry.name},\n\n"
        f"Thanks for writing to WallMeri - we have your message and a real person will "
        f"read it. We reply to most enquiries within one business day.\n\n"
        f"What you sent us:\n"
        f"  Topic: {_contact_category_label(enquiry.category)}\n"
        f"{subject_line}\n"
        f"{enquiry.message}\n\n"
        f"No need to write again - just reply here if you have anything to add.\n\n"
        f"- Team WallMeri"
    )
    send(enquiry.email, "We got your message - WallMeri", body)

