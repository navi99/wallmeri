from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Table, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.services import storage_service


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


# A poster can carry multiple category tags.
product_categories = Table(
    "product_categories",
    Base.metadata,
    Column("product_id", ForeignKey("products.id", ondelete="CASCADE"), primary_key=True),
    Column("category_id", ForeignKey("categories.id", ondelete="CASCADE"), primary_key=True),
)


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(160), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    # Price stored in whole INR rupees (single price, no variants).
    price_inr: Mapped[int] = mapped_column(Integer, nullable=False)
    image_url: Mapped[str] = mapped_column(String(500), nullable=False, default="")
    material: Mapped[str] = mapped_column(String(120), nullable=False, default="Metal")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # Set only for admin-uploaded images (see app.services.media_service);
    # NULL for pasted external URLs and seeded picsum placeholders, which
    # `image_url` alone continues to serve. NULL-safe on delete: removing the
    # asset (see admin_delete_product / _apply_product_image) just clears this.
    image_id: Mapped[int | None] = mapped_column(
        ForeignKey("media_assets.id", ondelete="SET NULL"), nullable=True
    )
    image: Mapped["MediaAsset | None"] = relationship()  # noqa: F821

    # None = Wallmeri Original (fully admin-managed poster).
    artist_id: Mapped[int | None] = mapped_column(
        ForeignKey("artists.id", ondelete="SET NULL"), nullable=True, index=True
    )
    artist: Mapped["Artist | None"] = relationship(back_populates="products")  # noqa: F821

    categories: Mapped[list["Category"]] = relationship(  # noqa: F821
        secondary=product_categories, back_populates="products"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False
    )

    @property
    def thumb_url(self) -> str:
        """480px derivative for small contexts (admin table rows, etc).

        Falls back to the full `image_url` when there's no managed asset
        (pasted external URL, seeded picsum placeholder) — those were never
        run through the upload pipeline so no thumbnail was ever generated.
        """
        if self.image is not None:
            return storage_service.public_url(self.image.thumb_key)
        return self.image_url
