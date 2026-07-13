import enum
from datetime import datetime, timezone

from sqlalchemy import (
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class OrderStatus(str, enum.Enum):
    pending = "pending"
    paid = "paid"
    # A paid order that contains at least one custom-upload line lands here
    # instead of `paid` — see order_service.mark_order_paid. Admin approves
    # (-> paid, enters normal fulfilment) or rejects (-> refunded, full
    # refund) via the custom-review endpoints in app.api.routes.admin.
    in_review = "in_review"
    shipped = "shipped"
    delivered = "delivered"
    failed = "failed"
    cancelled = "cancelled"
    refunded = "refunded"


# Legal admin/system transitions. Anything not listed is rejected server-side.
ORDER_TRANSITIONS: dict[OrderStatus, set[OrderStatus]] = {
    OrderStatus.pending: {OrderStatus.paid, OrderStatus.failed, OrderStatus.cancelled},
    OrderStatus.in_review: {OrderStatus.paid, OrderStatus.refunded},
    OrderStatus.paid: {OrderStatus.shipped, OrderStatus.cancelled, OrderStatus.refunded},
    OrderStatus.shipped: {OrderStatus.delivered, OrderStatus.refunded},
    OrderStatus.delivered: {OrderStatus.refunded},
    OrderStatus.failed: {OrderStatus.paid},  # retried payment can still succeed
    OrderStatus.cancelled: set(),
    OrderStatus.refunded: set(),
}


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    user: Mapped["User | None"] = relationship(back_populates="orders")  # noqa: F821

    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    status: Mapped[OrderStatus] = mapped_column(
        SAEnum(OrderStatus, name="order_status"),
        default=OrderStatus.pending,
        nullable=False,
    )

    # All money in whole INR rupees.
    subtotal_inr: Mapped[int] = mapped_column(Integer, nullable=False)
    shipping_inr: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_inr: Mapped[int] = mapped_column(Integer, nullable=False)

    shipping_address: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)

    razorpay_order_id: Mapped[str | None] = mapped_column(String(120), nullable=True, index=True)
    razorpay_payment_id: Mapped[str | None] = mapped_column(String(120), nullable=True)

    # Fulfilment (courier integration is post-MVP; free-text tracking for now).
    courier_name: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    tracking_number: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    shipped_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    delivered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Set by the admin custom-review approve/reject action (see admin.py).
    review_note: Mapped[str] = mapped_column(String(500), nullable=False, default="")
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )

    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order", cascade="all, delete-orphan"
    )

    @property
    def has_custom_items(self) -> bool:
        return any(item.is_custom for item in self.items)


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True
    )
    order: Mapped["Order"] = relationship(back_populates="items")

    product_id: Mapped[int | None] = mapped_column(
        ForeignKey("products.id", ondelete="SET NULL"), nullable=True
    )
    # Set instead of product_id for a custom-upload line — exactly one of the
    # two is populated per row (enforced by CartItemIn / create_payment, not
    # a DB constraint, mirroring how product_id has always been optional).
    custom_upload_id: Mapped[int | None] = mapped_column(
        ForeignKey("custom_uploads.id", ondelete="SET NULL"), nullable=True, index=True
    )
    custom_upload: Mapped["CustomUpload | None"] = relationship()  # noqa: F821

    # Snapshots so historical orders are stable even if the product changes.
    title_snapshot: Mapped[str] = mapped_column(String(200), nullable=False)
    slug_snapshot: Mapped[str] = mapped_column(String(160), nullable=False, default="")
    image_snapshot: Mapped[str] = mapped_column(String(500), nullable=False, default="")
    price_inr: Mapped[int] = mapped_column(Integer, nullable=False)
    qty: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    # Poster size chosen for a *product* line (mirrors CustomUpload.size_code
    # — a stable string snapshot, not a FK, since PosterSize rows are never
    # deleted). Null for custom lines, which carry their size via
    # custom_upload instead, and for legacy product lines ordered before
    # sizes applied to the regular catalog.
    size_code: Mapped[str | None] = mapped_column(String(20), nullable=True)

    @property
    def is_custom(self) -> bool:
        return self.custom_upload_id is not None
