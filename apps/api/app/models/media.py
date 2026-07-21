import enum
from datetime import datetime, timezone

from sqlalchemy import BigInteger, Boolean, DateTime, Enum as SAEnum, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class MediaKind(str, enum.Enum):
    product = "product"
    avatar = "avatar"
    custom = "custom"
    category = "category"
    site = "site"


class MediaAsset(Base):
    """A managed image upload and its generated derivatives.

    Rows store storage *keys*, not URLs — app.services.storage_service.public_url()
    computes the URL on read, so a row stays valid across an S3_PUBLIC_BASE_URL
    change or a local<->S3 migration. Products/artists reference a row 1:1 via a
    nullable FK (Product.image_id / Artist.avatar_id); pasted external URLs and
    seeded picsum placeholders have no row at all, so cleanup (see
    app.services.media_service) never touches them.
    """

    __tablename__ = "media_assets"

    id: Mapped[int] = mapped_column(primary_key=True)
    kind: Mapped[MediaKind] = mapped_column(SAEnum(MediaKind, name="media_kind"), nullable=False)

    # Storage keys for the three objects written at upload time.
    original_key: Mapped[str] = mapped_column(String(300), nullable=False)
    web_key: Mapped[str] = mapped_column(String(300), nullable=False)
    thumb_key: Mapped[str] = mapped_column(String(300), nullable=False)

    content_type: Mapped[str] = mapped_column(String(60), nullable=False)
    width: Mapped[int] = mapped_column(Integer, nullable=False)
    height: Mapped[int] = mapped_column(Integer, nullable=False)
    size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    content_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)

    # False until a product/artist save actually references this asset.
    # media_service.sweep_unattached() reclaims rows left behind by an upload
    # that was never followed by a save (form opened, image picked, closed).
    attached: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
