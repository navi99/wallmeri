"""Image storage: S3-compatible object store when configured, local disk otherwise.

Uploads are re-encoded with Pillow (strips EXIF, normalizes format) into a large
web size and a thumbnail. Returns public URLs for both.
"""
import io
import secrets
from dataclasses import dataclass
from pathlib import Path

from PIL import Image

from app.core.config import settings

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_UPLOAD_BYTES = 15 * 1024 * 1024  # 15 MB
WEB_MAX_PX = 1600
THUMB_MAX_PX = 480
JPEG_QUALITY = 85


class UploadError(ValueError):
    """User-correctable upload problem (bad type, too large, unreadable image)."""


@dataclass
class StoredImage:
    image_url: str
    thumb_url: str


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


def _put(key: str, body: bytes) -> str:
    if is_s3_configured():
        _s3_client().put_object(
            Bucket=settings.S3_BUCKET, Key=key, Body=body, ContentType="image/jpeg"
        )
        base = settings.S3_PUBLIC_BASE_URL.rstrip("/")
        if not base:
            # Fall back to path-style URL via the endpoint (works for public buckets).
            base = f"{settings.S3_ENDPOINT_URL.rstrip('/')}/{settings.S3_BUCKET}"
        return f"{base}/{key}"

    path = Path(settings.UPLOADS_DIR) / key
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(body)
    return f"{settings.PUBLIC_API_BASE_URL.rstrip('/')}/uploads/{key}"


def store_image(data: bytes, content_type: str, prefix: str = "products") -> StoredImage:
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise UploadError("Only JPEG, PNG or WebP images are allowed")
    if len(data) > MAX_UPLOAD_BYTES:
        raise UploadError("Image is too large (max 15 MB)")

    token = secrets.token_hex(8)
    image_url = _put(f"{prefix}/{token}.jpg", _process(data, WEB_MAX_PX))
    thumb_url = _put(f"{prefix}/{token}_thumb.jpg", _process(data, THUMB_MAX_PX))
    return StoredImage(image_url=image_url, thumb_url=thumb_url)
