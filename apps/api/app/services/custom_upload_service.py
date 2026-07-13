"""Custom-upload domain logic: DPI quality gate + crop-to-preview.

Sits between the public `/custom` routes and the byte-level `storage_service`,
mirroring how `media_service` sits between the admin upload routes and
`storage_service` — this module is the DB- and business-rule-aware layer.
"""
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import CustomUpload, CustomUploadStatus, MediaAsset, Orientation, PosterSize
from app.services import storage_service

CM_PER_INCH = 2.54


class CustomUploadError(ValueError):
    """User-correctable problem creating a custom item (bad size/crop/DPI)."""


def compute_dpi(size: PosterSize, orientation: Orientation, crop_width: int, crop_height: int) -> int:
    """Effective print DPI for a crop (source px) at a given size + orientation.

    PosterSize.width_cm/height_cm are stored portrait-first; landscape swaps
    which physical dimension is "width" vs "height".
    """
    width_cm, height_cm = float(size.width_cm), float(size.height_cm)
    if orientation == Orientation.landscape:
        width_cm, height_cm = height_cm, width_cm
    width_in = width_cm / CM_PER_INCH
    height_in = height_cm / CM_PER_INCH
    return int(min(crop_width / width_in, crop_height / height_in))


def dpi_band(dpi: int) -> str:
    if dpi >= settings.CUSTOM_DPI_OK:
        return "ok"
    if dpi >= settings.CUSTOM_DPI_MIN:
        return "warning"
    return "blocked"


def create_custom_item(
    db: Session,
    asset: MediaAsset,
    size: PosterSize,
    orientation: Orientation,
    crop_x: int,
    crop_y: int,
    crop_width: int,
    crop_height: int,
    user_id: int | None,
) -> CustomUpload:
    if not size.is_enabled:
        raise CustomUploadError("This size is not currently available")
    if crop_width <= 0 or crop_height <= 0:
        raise CustomUploadError("Invalid crop area")

    # The client scales crop coordinates from a resized preview image up to
    # the original's pixel space, so a sub-pixel rounding overshoot right at
    # the original's edge is expected on a full-bleed crop — clamp into
    # bounds instead of rejecting an otherwise good-faith crop.
    crop_x = max(0, min(crop_x, asset.width - 1))
    crop_y = max(0, min(crop_y, asset.height - 1))
    crop_width = min(crop_width, asset.width - crop_x)
    crop_height = min(crop_height, asset.height - crop_y)
    if crop_width <= 0 or crop_height <= 0:
        raise CustomUploadError("Crop area is outside the uploaded image")

    dpi = compute_dpi(size, orientation, crop_width, crop_height)
    if dpi < settings.CUSTOM_DPI_MIN:
        raise CustomUploadError(
            f"This crop is too low-resolution for {size.label} (about {dpi} DPI, need at "
            f"least {settings.CUSTOM_DPI_MIN}). Try a smaller size or a higher-resolution photo."
        )

    original = storage_service.read_bytes(asset.original_key)
    preview_bytes = storage_service.crop_to_jpeg(
        original, crop_x, crop_y, crop_width, crop_height, max_px=settings.CUSTOM_PREVIEW_MAX_PX
    )
    preview_key = storage_service.store_bytes("custom", preview_bytes, "preview")

    item = CustomUpload(
        media_id=asset.id,
        user_id=user_id,
        size_code=size.code,
        orientation=orientation,
        crop_x=crop_x,
        crop_y=crop_y,
        crop_width=crop_width,
        crop_height=crop_height,
        dpi=dpi,
        price_inr=size.price_inr,
        preview_key=preview_key,
        status=CustomUploadStatus.draft,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def sweep_drafts(db: Session, older_than: timedelta = timedelta(hours=24)) -> int:
    """Delete draft custom uploads (never attached to a paid order) past the
    grace period. The underlying MediaAsset is reclaimed separately by
    media_service.sweep_unattached — a custom upload's source asset stays
    attached=False until checkout attaches it (see checkout.create_payment).
    """
    cutoff = datetime.now(timezone.utc) - older_than
    stale = (
        db.query(CustomUpload)
        .filter(CustomUpload.status == CustomUploadStatus.draft, CustomUpload.created_at < cutoff)
        .all()
    )
    for item in stale:
        storage_service.delete_keys([item.preview_key])
        db.delete(item)
    db.commit()
    return len(stale)
