from datetime import datetime, timezone

from sqlalchemy import Boolean, CheckConstraint, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)

# The one row's id. A site-wide sale is a single global setting, not a
# per-entity one, so this table is a singleton (seeded by migration 0014) -
# get_effective_discount always reads id=1 and admin_update_discount always
# writes it. Modelled on SiteImage: admin-configurable global state that
# needs no deploy to change.
DISCOUNT_SETTINGS_ID = 1

# Guard rail shared with the API schema. Capped well below 100 so a
# fat-fingered "95" can't near-zero the catalog, and kept a whole number so
# the rupee rounding in apply_discount stays exact integer maths on both
# sides of the wire (see apps/web/lib/utils.ts applyDiscount).
MAX_DISCOUNT_PERCENT = 90


class DiscountSettings(Base):
    """Site-wide festive/occasion discount. Singleton - see DISCOUNT_SETTINGS_ID."""

    __tablename__ = "discount_settings"
    __table_args__ = (
        CheckConstraint(
            f"percent >= 0 AND percent <= {MAX_DISCOUNT_PERCENT}",
            name="ck_discount_percent_range",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    # Whole percent off, 0..MAX_DISCOUNT_PERCENT. 0 means "no discount" just
    # as surely as is_active=False does; both paths must render prices
    # exactly as they were before this feature existed.
    percent: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")

    # Occasion name shown next to discounted prices, e.g. "Diwali". Kept
    # short on purpose - DESIGN.md bans discount-screaming copy.
    label: Mapped[str] = mapped_column(String(80), nullable=False, default="", server_default="")

    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false"
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False
    )
