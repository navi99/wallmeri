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
    shipped = "shipped"
    delivered = "delivered"
    failed = "failed"
    cancelled = "cancelled"
    refunded = "refunded"


# Legal admin/system transitions. Anything not listed is rejected server-side.
ORDER_TRANSITIONS: dict[OrderStatus, set[OrderStatus]] = {
    OrderStatus.pending: {OrderStatus.paid, OrderStatus.failed, OrderStatus.cancelled},
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

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )

    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order", cascade="all, delete-orphan"
    )


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
    # Snapshots so historical orders are stable even if the product changes.
    title_snapshot: Mapped[str] = mapped_column(String(200), nullable=False)
    slug_snapshot: Mapped[str] = mapped_column(String(160), nullable=False, default="")
    image_snapshot: Mapped[str] = mapped_column(String(500), nullable=False, default="")
    price_inr: Mapped[int] = mapped_column(Integer, nullable=False)
    qty: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
