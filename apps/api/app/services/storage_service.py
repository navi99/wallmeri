"""Image storage: S3-compatible object store when configured, local disk otherwise.

Every upload keeps the **original** bytes untouched (satisfies the "originals
retained" requirement — see docs/backlog/MVP.md S-M2.1 and E10's later need to
crop/print from the source file) alongside two Pillow-generated JPEG
derivatives: a large web size and a thumbnail.

Functions here only touch bytes/keys — they know nothing about the database.
`app.services.media_service` is the DB-aware layer that turns a `StoredImage`
into a `MediaAsset` row and later cleans one up. Storage *keys* (not URLs) are
the thing callers should persist; call `public_url(key)` at read time so a
row stays valid across an `S3_PUBLIC_BASE_URL` change or a local<->S3 move.
"""
import hashlib
import io
import secrets
from dataclasses import dataclass
from pathlib import Path

from PIL import Image

from app.core.config import settings

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
_EXT_BY_CONTENT_TYPE = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
}

ALLOWED_VIDEO_CONTENT_TYPES = {"video/mp4", "video/webm"}
_VIDEO_EXT_BY_CONTENT_TYPE = {
    "video/mp4": "mp4",
    "video/webm": "webm",
}

# Mirrors settings at import time (env-configurable); kept as module
# constants since callers/tests reference them directly, e.g.
# storage_service.MAX_UPLOAD_BYTES.
MAX_UPLOAD_BYTES = settings.MAX_UPLOAD_BYTES
WEB_MAX_PX = settings.IMAGE_WEB_MAX_PX
THUMB_MAX_PX = settings.IMAGE_THUMB_MAX_PX
JPEG_QUALITY = settings.IMAGE_JPEG_QUALITY
MAX_VIDEO_UPLOAD_BYTES = settings.MAX_VIDEO_UPLOAD_BYTES


class UploadError(ValueError):
    """User-correctable upload problem (bad type, too large, unreadable image)."""


@dataclass
class StoredImage:
    original_key: str
    web_key: str
    thumb_key: str
    content_type: str
    width: int
    height: int
    size_bytes: int
    content_hash: str


def is_s3_configured() -> bool:
    return bool(settings.S3_BUCKET and settings.S3_ACCESS_KEY_ID and settings.S3_SECRET_ACCESS_KEY)


def _s3_client():
    import boto3

    kwargs = {
        "aws_access_key_id": settings.S3_ACCESS_KEY_ID,
        "aws_secret_access_key": settings.S3_SECRET_ACCESS_KEY,
        "region_name": settings.S3_REGION,
    }
    if settings.S3_ENDPOINT_URL:
        kwargs["endpoint_url"] = settings.S3_ENDPOINT_URL
    return boto3.client("s3", **kwargs)


def _process(data: bytes, max_px: int) -> bytes:
    try:
        img = Image.open(io.BytesIO(data))
        img.load()
    except Exception as exc:  # Pillow raises many types for corrupt images
        raise UploadError("File is not a readable image") from exc
    if img.mode not in ("RGB", "L"):
        img = img.convert("RGB")
    img.thumbnail((max_px, max_px))
    out = io.BytesIO()
    img.save(out, format="JPEG", quality=JPEG_QUALITY, optimize=True)
    return out.getvalue()


def _put(key: str, body: bytes, content_type: str) -> None:
    if is_s3_configured():
        _s3_client().put_object(
            Bucket=settings.S3_BUCKET, Key=key, Body=body, ContentType=content_type
        )
        return
    path = Path(settings.UPLOADS_DIR) / key
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(body)


def public_url(key: str) -> str:
    """Compute the public URL for a previously-stored key."""
    if is_s3_configured():
        base = settings.S3_PUBLIC_BASE_URL.rstrip("/")
        if not base:
            # Fall back to path-style URL via the endpoint (works for public buckets).
            base = f"{settings.S3_ENDPOINT_URL.rstrip('/')}/{settings.S3_BUCKET}"
        return f"{base}/{key}"
    return f"{settings.PUBLIC_API_BASE_URL.rstrip('/')}/uploads/{key}"


def read_bytes(key: str) -> bytes:
    """Fetch a previously stored object's raw bytes (e.g. an original, to
    re-crop for a custom-upload preview or print file)."""
    if is_s3_configured():
        obj = _s3_client().get_object(Bucket=settings.S3_BUCKET, Key=key)
        return obj["Body"].read()
    return (Path(settings.UPLOADS_DIR) / key).read_bytes()


def crop_to_jpeg(data: bytes, x: int, y: int, width: int, height: int, max_px: int | None = None) -> bytes:
    """Crop a region (source pixels) out of an image and re-encode as JPEG.

    Callers are responsible for clamping (x, y, width, height) to the source
    image's bounds — see app.services.custom_upload_service.
    """
    img = Image.open(io.BytesIO(data))
    img.load()
    if img.mode not in ("RGB", "L"):
        img = img.convert("RGB")
    cropped = img.crop((x, y, x + width, y + height))
    if max_px is not None:
        cropped.thumbnail((max_px, max_px))
    out = io.BytesIO()
    cropped.save(out, format="JPEG", quality=JPEG_QUALITY, optimize=True)
    return out.getvalue()


def store_bytes(kind: str, data: bytes, suffix: str, content_type: str = "image/jpeg") -> str:
    """Write an already-encoded image under a fresh token key. Returns the key."""
    token = secrets.token_hex(8)
    ext = "jpg" if content_type == "image/jpeg" else content_type.split("/")[-1]
    key = f"{kind}/{token}_{suffix}.{ext}"
    _put(key, data, content_type)
    return key


def delete_keys(keys: list[str]) -> None:
    """Delete storage objects. Tolerant of keys that are already gone."""
    keys = [k for k in keys if k]
    if not keys:
        return
    if is_s3_configured():
        _s3_client().delete_objects(
            Bucket=settings.S3_BUCKET, Delete={"Objects": [{"Key": k} for k in keys]}
        )
        return
    for key in keys:
        (Path(settings.UPLOADS_DIR) / key).unlink(missing_ok=True)


def store_image(data: bytes, content_type: str, kind: str = "product") -> StoredImage:
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise UploadError("Only JPEG, PNG or WebP images are allowed")
    if len(data) > MAX_UPLOAD_BYTES:
        raise UploadError("Image is too large (max 15 MB)")

    try:
        probe = Image.open(io.BytesIO(data))
        probe.load()
        width, height = probe.size
    except Exception as exc:  # Pillow raises many types for corrupt images
        raise UploadError("File is not a readable image") from exc

    token = secrets.token_hex(8)
    ext = _EXT_BY_CONTENT_TYPE[content_type]

    original_key = f"{kind}/{token}_orig.{ext}"
    web_key = f"{kind}/{token}.jpg"
    thumb_key = f"{kind}/{token}_thumb.jpg"

    _put(original_key, data, content_type)
    _put(web_key, _process(data, WEB_MAX_PX), "image/jpeg")
    _put(thumb_key, _process(data, THUMB_MAX_PX), "image/jpeg")

    return StoredImage(
        original_key=original_key,
        web_key=web_key,
        thumb_key=thumb_key,
        content_type=content_type,
        width=width,
        height=height,
        size_bytes=len(data),
        content_hash=hashlib.sha256(data).hexdigest(),
    )


def store_video(data: bytes, content_type: str, kind: str = "site") -> StoredImage:
    """Store a video upload (e.g. the homepage hero video).

    No Pillow-generated derivatives — the original bytes are the only object
    written, reused for all three `StoredImage` key fields so this fits the
    same `MediaAsset` row shape as an image. Width/height are meaningless for
    video and left 0; callers must not treat them as real dimensions.
    """
    if content_type not in ALLOWED_VIDEO_CONTENT_TYPES:
        raise UploadError("Only MP4 or WebM videos are allowed")
    if len(data) > MAX_VIDEO_UPLOAD_BYTES:
        raise UploadError("Video is too large (max 30 MB)")

    token = secrets.token_hex(8)
    ext = _VIDEO_EXT_BY_CONTENT_TYPE[content_type]
    key = f"{kind}/{token}_orig.{ext}"
    _put(key, data, content_type)

    return StoredImage(
        original_key=key,
        web_key=key,
        thumb_key=key,
        content_type=content_type,
        width=0,
        height=0,
        size_bytes=len(data),
        content_hash=hashlib.sha256(data).hexdigest(),
    )
