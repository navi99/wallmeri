"""Server-side pricing so totals can never be tampered with on the client."""
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import Product
from app.schemas.order import CartItemIn, QuoteLine


def compute_quote(db: Session, items: list[CartItemIn]) -> tuple[list[QuoteLine], int, int, int]:
    """Returns (lines, subtotal, shipping, total) in whole INR rupees."""
    if not items:
        raise ValueError("Cart is empty")

    # Collapse duplicate product ids by summing quantities.
    qty_by_id: dict[int, int] = {}
    for item in items:
        qty_by_id[item.product_id] = qty_by_id.get(item.product_id, 0) + item.qty

    products = (
        db.query(Product)
        .filter(Product.id.in_(qty_by_id.keys()), Product.is_active.is_(True))
        .all()
    )
    found = {p.id: p for p in products}

    lines: list[QuoteLine] = []
    subtotal = 0
    for product_id, qty in qty_by_id.items():
        product = found.get(product_id)
        if product is None:
            raise ValueError(f"Product {product_id} is unavailable")
        line_total = product.price_inr * qty
        subtotal += line_total
        lines.append(
            QuoteLine(
                product_id=product.id,
                slug=product.slug,
                title=product.title,
                image_url=product.image_url,
                price_inr=product.price_inr,
                qty=qty,
                line_total_inr=line_total,
            )
        )

    if subtotal >= settings.FREE_SHIPPING_THRESHOLD_INR:
        shipping = 0
    else:
        shipping = settings.SHIPPING_FLAT_INR
    total = subtotal + shipping
    return lines, subtotal, shipping, total
