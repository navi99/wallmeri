import enum
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.services import storage_service


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Orientation(str, enum.Enum):
    portrait = "portrait"
    landscape = "landscape"


class CustomUploadStatus(str, enum.Enum):
    # draft: created by the storefront wizard, not yet attached to a paid
    # order — eligible for custom_upload_service.sweep_drafts() cleanup.
    draft = "draft"
    # ordered: attached to an OrderItem at checkout; kept forever (needed to
    # reprint / re-review), never swept.
    ordered = "ordered"


class CustomUpload(Base):
    """One cropped custom-poster design.

    Holds the crop *coordinates* against the underlying MediaAsset's original
    (not a re-encoded image) so production always prints from the source file
    at full quality — see app.services.custom_upload_service.
    """

    __tablename__ = "custom_uploads"

    id: Mapped[int] = mapped_column(primary_key=True)

    media_id: Mapped[int] = mapped_column(
        ForeignKey("media_assets.id", ondelete="CASCADE"), nullable=False, index=True
    )
    media: Mapped["MediaAsset"] = relationship()  # noqa: F821

    # Nullable — guests can use the custom-upload flow like any other checkout.
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )

    # String snapshot, not a FK to PosterSize — stays stable even if the size
    # is later renamed/disabled/removed from the admin size table.
    size_code: Mapped[str] = mapped_column(String(20), nullable=False)
    orientation: Mapped[Orientation] = mapped_column(
        SAEnum(Orientation, name="custom_orientation"), nullable=False
    )

    # Crop rectangle in the *original* image's source pixels.
    crop_x: Mapped[int] = mapped_column(Integer, nullable=False)
    crop_y: Mapped[int] = mapped_column(Integer, nullable=False)
    crop_width: Mapped[int] = mapped_column(Integer, nullable=False)
    crop_height: Mapped[int] = mapped_column(Integer, nullable=False)

    dpi: Mapped[int] = mapped_column(Integer, nullable=False)
    # Snapshot of PosterSize.price_inr at creation time — server pricing is
    # re-derived from the *current* PosterSize at quote time regardless (see
    # pricing.compute_quote); this column is the audit trail of what the
    # customer was shown when they added it to their cart.
    price_inr: Mapped[int] = mapped_column(Integer, nullable=False)

    preview_key: Mapped[str] = mapped_column(String(300), nullable=False)
    status: Mapped[CustomUploadStatus] = mapped_column(
        SAEnum(CustomUploadStatus, name="custom_upload_status"),
        default=CustomUploadStatus.draft,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )

    @property
    def preview_url(self) -> str:
        """Safe to show anywhere customer-facing (cart, order page, admin list)."""
        return storage_service.public_url(self.preview_key)

    @property
    def original_url(self) -> str:
        """The full-resolution source file. Only ever surfaced through the
        admin-authenticated print-file endpoint — never linked from a
        customer-facing page or email."""
        return storage_service.public_url(self.media.original_key)
