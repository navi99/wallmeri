from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # Display poster shown on the "shop by category" tile. Empty/NULL is a
    # valid state — the storefront falls back to a gradient tile (see
    # ShopByCategory) rather than requiring every category to have art.
    poster_image_url: Mapped[str] = mapped_column(String(500), nullable=False, default="")

    # Set only for admin-uploaded posters (see app.services.media_service);
    # NULL for pasted external URLs, which `poster_image_url` alone continues
    # to serve.
    poster_image_id: Mapped[int | None] = mapped_column(
        ForeignKey("media_assets.id", ondelete="SET NULL"), nullable=True
    )
    poster_image: Mapped["MediaAsset | None"] = relationship()  # noqa: F821

    products: Mapped[list["Product"]] = relationship(  # noqa: F821
        secondary="product_categories", back_populates="categories"
    )
