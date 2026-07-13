from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class PosterSize(Base):
    """Admin-managed print size -> price tier.

    Sizes are never deleted once used by an order (see CustomUpload.size_code,
    which is a stable string snapshot, not a FK) — admins add/enable/disable/
    reprice rows instead. Disabling a size only hides it from new uploads;
    in-flight custom_uploads keep the price they were created with.

    Two independent price fields, since this table serves two different
    pricing models:
    - price_inr: the *absolute* price for a "Create your own" custom upload
      at this size (custom designs have no other price to start from).
    - delta_inr: the adjustment applied to a regular catalog Product's
      price_inr (which is always quoted for A4) to get its price at this
      size — 0 at A4, negative for smaller sizes, positive for larger ones.
    """

    __tablename__ = "poster_sizes"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    label: Mapped[str] = mapped_column(String(80), nullable=False)
    width_cm: Mapped[Decimal] = mapped_column(Numeric(5, 1), nullable=False)
    height_cm: Mapped[Decimal] = mapped_column(Numeric(5, 1), nullable=False)
    price_inr: Mapped[int] = mapped_column(Integer, nullable=False)
    delta_inr: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
