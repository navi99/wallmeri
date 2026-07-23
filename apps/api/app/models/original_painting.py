import enum
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.services import storage_service


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class OriginalPaintingStatus(str, enum.Enum):
    available = "available"
    reserved = "reserved"
    sold = "sold"


class OriginalPainting(Base):
    """The one physical original behind a product's metal-print reproduction.

    1:1 with Product (product_id is unique) — most products have none. Kept
    as its own table rather than fields on Product so the reproduction-facing
    catalog rows stay lean; see docs discussion in the "Buy Original" plan.
    """

    __tablename__ = "original_paintings"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    product: Mapped["Product"] = relationship(back_populates="original_painting")  # noqa: F821

    medium: Mapped[str] = mapped_column(String(160), nullable=False, default="")
    width_cm: Mapped[Decimal] = mapped_column(Numeric(5, 1), nullable=False)
    height_cm: Mapped[Decimal] = mapped_column(Numeric(5, 1), nullable=False)
    year_created: Mapped[int | None] = mapped_column(Integer, nullable=True)
    price_inr: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[OriginalPaintingStatus] = mapped_column(
        SAEnum(OriginalPaintingStatus, name="original_painting_status"),
        default=OriginalPaintingStatus.available,
        nullable=False,
    )
    story: Mapped[str] = mapped_column(Text, nullable=False, default="")

    # Falls back to the parent product's gallery when unset — most originals
    # are photographed the same as their reproduction.
    image_id: Mapped[int | None] = mapped_column(
        ForeignKey("media_assets.id", ondelete="SET NULL"), nullable=True
    )
    image: Mapped["MediaAsset | None"] = relationship()  # noqa: F821

    inquiries: Mapped[list["OriginalInquiry"]] = relationship(
        cascade="all, delete-orphan", back_populates="painting"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False
    )

    @property
    def image_url(self) -> str:
        if self.image is not None:
            return storage_service.public_url(self.image.web_key)
        return ""


class InquiryStatus(str, enum.Enum):
    new = "new"
    contacted = "contacted"
    negotiating = "negotiating"
    won = "won"
    lost = "lost"


class OriginalInquiry(Base):
    """A buyer's expression of interest in an OriginalPainting — a lead for
    the admin team to follow up on manually, not a checkout/payment flow."""

    __tablename__ = "original_inquiries"

    id: Mapped[int] = mapped_column(primary_key=True)
    original_painting_id: Mapped[int] = mapped_column(
        ForeignKey("original_paintings.id", ondelete="CASCADE"), nullable=False
    )
    painting: Mapped["OriginalPainting"] = relationship(back_populates="inquiries")

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=False, default="")
    message: Mapped[str] = mapped_column(Text, nullable=False, default="")
    status: Mapped[InquiryStatus] = mapped_column(
        SAEnum(InquiryStatus, name="original_inquiry_status"),
        default=InquiryStatus.new,
        nullable=False,
    )
    admin_note: Mapped[str] = mapped_column(Text, nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
