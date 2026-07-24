"""DB-aware lifecycle for uploaded images, on top of the byte/key-level
`storage_service`.

An upload (`POST /admin/uploads`) creates a `MediaAsset` row immediately via
`create_asset`, independent of whatever product/artist save may or may not
follow. A row starts `attached=False`; the product/artist endpoints call
`attach()` once it's actually referenced, and `delete_asset()` whenever an
attached image is replaced or its owner is deleted. `sweep_unattached()`
reclaims rows left behind by an upload that was never saved (form opened,
image picked, then closed) — run it via `apps/api/scripts/gc_media.py`.
"""
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.media import MediaAsset, MediaKind
from app.services import storage_service


def create_asset(db: Session, data: bytes, content_type: str, kind: MediaKind) -> MediaAsset:
    if content_type in storage_service.ALLOWED_VIDEO_CONTENT_TYPES:
        stored = storage_service.store_video(data, content_type, kind.value)
    else:
        stored = storage_service.store_image(data, content_type, kind.value)
    asset = MediaAsset(
        kind=kind,
        original_key=stored.original_key,
        web_key=stored.web_key,
        thumb_key=stored.thumb_key,
        content_type=stored.content_type,
        width=stored.width,
        height=stored.height,
        size_bytes=stored.size_bytes,
        content_hash=stored.content_hash,
        attached=False,
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset


def attach(asset: MediaAsset) -> None:
    asset.attached = True


def delete_asset(db: Session, asset: MediaAsset) -> None:
    """Remove an asset's storage objects and its row.

    Does not commit — callers fold this into the same transaction as the
    owning product/artist change (create/replace/delete), so a mid-request
    failure rolls back the row deletion too. The storage delete itself still
    happens first and isn't transactional; see the plan's noted risk.
    """
    storage_service.delete_keys([asset.original_key, asset.web_key, asset.thumb_key])
    db.delete(asset)


def sweep_unattached(db: Session, older_than: timedelta = timedelta(hours=24)) -> int:
    """Delete assets uploaded but never attached to a save, past the grace period."""
    cutoff = datetime.now(timezone.utc) - older_than
    stale = (
        db.query(MediaAsset)
        .filter(MediaAsset.attached.is_(False), MediaAsset.created_at < cutoff)
        .all()
    )
    for asset in stale:
        delete_asset(db, asset)
    db.commit()
    return len(stale)
