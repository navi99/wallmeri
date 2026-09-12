"""Server-side pricing so totals can never be tampered with on the client."""
from dataclasses import dataclass

from sqlalchemy.orm import Session

from app.models import CustomUpload, CustomUploadStatus, PosterSize, Product
from app.schemas.order import CartItemIn, QuoteLine
from app.services import discount as discount_service


@dataclass
class Quote:
    """A fully priced basket. All money in whole INR rupees.

    subtotal/total are what will actually be charged (discount already
    applied); original_subtotal is what the same basket would have cost at
    list price. discount_amount is the difference, precomputed so invoices
    and emails never have to re-derive it.
    """

    lines: list[QuoteLine]
    subtotal: int
    shipping: int
    total: int
    original_subtotal: int
    discount_percent: int
    discount_label: str

    @property
    def discount_amount(self) -> int:
        return self.original_subtotal - self.subtotal


def compute_quote(db: Session, items: list[CartItemIn]) -> Quote:
    """Prices a basket against *current* catalog and discount state."""
    if not items:
        raise ValueError("Cart is empty")

    # Read once, so every line in a basket is priced against the same
    # discount even if an admin toggles it mid-request.
    percent, discount_label = discount_service.active_discount(db)

    product_lines = [i for i in items if i.product_id is not None]
    custom_lines = [i for i in items if i.custom_upload_id is not None]

    lines: list[QuoteLine] = []
    subtotal = 0
    original_subtotal = 0

    if product_lines:
        # Collapse duplicate (product, size) pairs by summing quantities -
        # two different sizes of the same product are distinct lines.
        qty_by_key: dict[tuple[int, str | None], int] = {}
        for item in product_lines:
            key = (item.product_id, item.size_code)
            qty_by_key[key] = qty_by_key.get(key, 0) + item.qty

        product_ids = {product_id for product_id, _ in qty_by_key}
        products = (
            db.query(Product)
            .filter(Product.id.in_(product_ids), Product.is_active.is_(True))
            .all()
        )
        found = {p.id: p for p in products}

        size_codes = {size_code for _, size_code in qty_by_key if size_code is not None}
        sizes_by_code = (
            {s.code: s for s in db.query(PosterSize).filter(PosterSize.code.in_(size_codes)).all()}
            if size_codes
            else {}
        )

        for (product_id, size_code), qty in qty_by_key.items():
            product = found.get(product_id)
            if product is None:
                raise ValueError(f"Product {product_id} is unavailable")

            if size_code is not None:
                # Never trust the price a product line was added to the cart
                # with - re-derive from the *current* PosterSize (see the
                # matching custom-line comment below). product.price_inr is
                # always quoted for A4; delta_inr adjusts it for other sizes
                # (0 at A4) - this is a different price model from custom
                # uploads, which price directly off size.price_inr instead.
                size = sizes_by_code.get(size_code)
                if size is None or not size.is_enabled:
                    raise ValueError(f"Size '{size_code}' is no longer available")
                list_price = product.price_inr + size.delta_inr
                title = f"{product.title} - {size.label}"
            else:
                list_price = product.price_inr
                title = product.title

            # Discount the *composed* price, not the base: rounding the base
            # and the delta separately would not add up to rounding the sum.
            price = discount_service.apply(list_price, percent)
            line_total = price * qty
            subtotal += line_total
            original_subtotal += list_price * qty
            lines.append(
                QuoteLine(
                    kind="product",
                    product_id=product.id,
                    size_code=size_code,
                    slug=product.slug,
                    title=title,
                    image_url=product.image_url,
                    price_inr=price,
                    qty=qty,
                    line_total_inr=line_total,
                    original_price_inr=list_price,
                    original_line_total_inr=list_price * qty,
                )
            )

    for item in custom_lines:
        custom = db.get(CustomUpload, item.custom_upload_id)
        if custom is None or custom.status != CustomUploadStatus.draft:
            raise ValueError(f"Custom design {item.custom_upload_id} is unavailable")
        # Never trust the price a custom upload was created with - re-derive
        # from the *current* PosterSize (it may have been repriced or
        # disabled since the customer added it to their cart).
        size = db.query(PosterSize).filter(PosterSize.code == custom.size_code).first()
        if size is None or not size.is_enabled:
            raise ValueError(f"Size '{custom.size_code}' is no longer available")

        price = discount_service.apply(size.price_inr, percent)
        line_total = price * item.qty
        subtotal += line_total
        original_subtotal += size.price_inr * item.qty
        lines.append(
            QuoteLine(
                kind="custom",
                custom_upload_id=custom.id,
                title=f"Custom poster - {size.label}",
                image_url=custom.preview_url,
                price_inr=price,
                qty=item.qty,
                line_total_inr=line_total,
                original_price_inr=size.price_inr,
                original_line_total_inr=size.price_inr * item.qty,
            )
        )

    shipping = 0
    total = subtotal + shipping
    return Quote(
        lines=lines,
        subtotal=subtotal,
        shipping=shipping,
        total=total,
        original_subtotal=original_subtotal,
        discount_percent=percent,
        discount_label=discount_label,
    )
