"""The site-wide discount: one percent, read from a singleton row.

Every rupee the customer is charged goes through apply() via
services.pricing.compute_quote, and every rupee the customer is *shown* goes
through the mirror of apply() in apps/web/lib/discount.ts. The two must stay
byte-for-byte equivalent - see the rounding note on apply().
"""
from sqlalchemy.orm import Session

from app.models import DISCOUNT_SETTINGS_ID, DiscountSettings


def get_settings(db: Session) -> DiscountSettings:
    """The singleton row, created on demand.

    Migration 0014 seeds it, so the insert here only ever fires on a
    hand-rolled database - cheaper than making every caller handle None.
    """
    row = db.get(DiscountSettings, DISCOUNT_SETTINGS_ID)
    if row is None:
        row = DiscountSettings(id=DISCOUNT_SETTINGS_ID, percent=0, label="", is_active=False)
        db.add(row)
        db.flush()
    return row


def active_discount(db: Session) -> tuple[int, str]:
    """(percent, label), or (0, "") when no discount is running.

    The single "is the discount off?" predicate for the backend: an inactive
    row and a 0% row are deliberately indistinguishable to callers, so there
    is exactly one no-discount code path to reason about.
    """
    row = get_settings(db)
    if not row.is_active or row.percent <= 0:
        return 0, ""
    return row.percent, row.label


def apply(price_inr: int, percent: int) -> int:
    """Discounted whole-rupee price, rounded half-up.

    Pure integer arithmetic, never float: `round()` is banker's rounding in
    Python, so 110 @ 5% (= 104.5) would round *down* to 104 while JS's
    Math.round gives 105 - a one-rupee client/server disagreement on exactly
    the .5 cases. The +50 before the floor-divide is half-up in both
    languages.

    Always applied to a *unit* price, never to a line total or a subtotal:
    that is what makes sum(unit * qty) == subtotal exact, with no rounding
    residue to reconcile (see compute_quote).

    Floored at 1 rupee. The 90% cap alone does not guarantee it - a 1-rupee
    base discounts to 0 - and a zero-rupee line would mean a free item and,
    for a single-line cart, a 0-paise order Razorpay rejects outright.
    """
    if percent <= 0 or price_inr <= 0:
        return price_inr
    return max(1, (price_inr * (100 - percent) + 50) // 100)
