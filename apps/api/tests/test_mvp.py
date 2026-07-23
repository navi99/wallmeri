"""Unit tests that don't need a live database.

Run inside the api container: docker compose exec api pytest
"""
import io

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app
from app.models import ORDER_TRANSITIONS, OrderStatus
from app.services import storage_service

client = TestClient(app)

ADMIN_ENDPOINTS = [
    ("GET", "/api/admin/products"),
    ("POST", "/api/admin/products"),
    ("GET", "/api/admin/orders"),
    ("GET", "/api/admin/artists"),
    ("POST", "/api/admin/artists"),
    ("GET", "/api/admin/artist-applications"),
    ("GET", "/api/admin/reviews"),
    ("GET", "/api/admin/categories"),
    ("POST", "/api/admin/uploads"),
    ("GET", "/api/admin/original-inquiries"),
    ("PUT", "/api/admin/products/1/original"),
    ("DELETE", "/api/admin/products/1/original"),
]


@pytest.mark.parametrize("method,path", ADMIN_ENDPOINTS)
def test_admin_routes_require_auth(method, path):
    res = client.request(method, path)
    assert res.status_code == 401


@pytest.mark.parametrize("method,path", ADMIN_ENDPOINTS)
def test_admin_routes_reject_garbage_token(method, path):
    res = client.request(method, path, headers={"Authorization": "Bearer not-a-jwt"})
    assert res.status_code == 401


class TestOrderTransitions:
    def test_every_status_has_transition_entry(self):
        assert set(ORDER_TRANSITIONS.keys()) == set(OrderStatus)

    def test_terminal_states(self):
        assert ORDER_TRANSITIONS[OrderStatus.cancelled] == set()
        assert ORDER_TRANSITIONS[OrderStatus.refunded] == set()

    def test_no_skipping_straight_to_delivered(self):
        assert OrderStatus.delivered not in ORDER_TRANSITIONS[OrderStatus.pending]
        assert OrderStatus.delivered not in ORDER_TRANSITIONS[OrderStatus.paid]

    def test_paid_can_ship(self):
        assert OrderStatus.shipped in ORDER_TRANSITIONS[OrderStatus.paid]
        assert OrderStatus.delivered in ORDER_TRANSITIONS[OrderStatus.shipped]


class TestStorageValidation:
    def _png_bytes(self) -> bytes:
        buf = io.BytesIO()
        Image.new("RGB", (100, 130), "red").save(buf, format="PNG")
        return buf.getvalue()

    def test_rejects_bad_content_type(self):
        with pytest.raises(storage_service.UploadError):
            storage_service.store_image(b"x", "text/plain")

    def test_rejects_oversize(self):
        big = b"0" * (storage_service.MAX_UPLOAD_BYTES + 1)
        with pytest.raises(storage_service.UploadError):
            storage_service.store_image(big, "image/png")

    def test_rejects_corrupt_image(self):
        with pytest.raises(storage_service.UploadError):
            storage_service.store_image(b"not an image at all", "image/png")

    def test_stores_original_plus_two_derivatives_locally(self, tmp_path, monkeypatch):
        from app.core.config import settings

        monkeypatch.setattr(settings, "UPLOADS_DIR", str(tmp_path))
        png = self._png_bytes()
        stored = storage_service.store_image(png, "image/png", kind="product")

        # Original is retained byte-for-byte (not re-encoded) — MVP S-M2.1.
        assert stored.original_key.endswith(".png")
        assert stored.web_key.endswith(".jpg")
        assert stored.thumb_key.endswith("_thumb.jpg")
        assert stored.width == 100
        assert stored.height == 130
        assert stored.size_bytes == len(png)
        assert len(stored.content_hash) == 64  # sha256 hex digest

        for key in (stored.original_key, stored.web_key, stored.thumb_key):
            assert (tmp_path / key).is_file()
        assert (tmp_path / stored.original_key).read_bytes() == png
        assert len([p for p in tmp_path.rglob("*") if p.is_file()]) == 3

    def test_public_url_local(self, monkeypatch):
        from app.core.config import settings

        monkeypatch.setattr(settings, "S3_BUCKET", "")
        monkeypatch.setattr(settings, "PUBLIC_API_BASE_URL", "http://localhost:8000")
        assert (
            storage_service.public_url("product/abc.jpg")
            == "http://localhost:8000/uploads/product/abc.jpg"
        )

    def test_public_url_s3(self, monkeypatch):
        from app.core.config import settings

        monkeypatch.setattr(settings, "S3_BUCKET", "wallmeri-media")
        monkeypatch.setattr(settings, "S3_ACCESS_KEY_ID", "key")
        monkeypatch.setattr(settings, "S3_SECRET_ACCESS_KEY", "secret")
        monkeypatch.setattr(settings, "S3_PUBLIC_BASE_URL", "https://media.wallmeri.in")
        assert (
            storage_service.public_url("product/abc.jpg")
            == "https://media.wallmeri.in/product/abc.jpg"
        )

    def test_delete_keys_is_idempotent(self, tmp_path, monkeypatch):
        from app.core.config import settings

        monkeypatch.setattr(settings, "UPLOADS_DIR", str(tmp_path))
        stored = storage_service.store_image(self._png_bytes(), "image/png")
        keys = [stored.original_key, stored.web_key, stored.thumb_key]

        storage_service.delete_keys(keys)
        assert not any((tmp_path / k).exists() for k in keys)
        storage_service.delete_keys(keys)  # already gone — must not raise
        storage_service.delete_keys([])  # empty list — must not raise


def test_intake_honeypot_returns_ok_without_storing():
    res = client.post(
        "/api/artist-applications",
        json={"name": "Bot Bot", "email": "bot@spam.com", "website": "http://spam"},
    )
    # Honeypot short-circuits before any DB access.
    assert res.status_code == 201
    assert res.json() == {"ok": True}


def test_original_inquiry_honeypot_returns_ok_for_any_slug():
    # Tripped honeypot short-circuits before the painting lookup, so this
    # succeeds even for a product/slug that doesn't exist.
    res = client.post(
        "/api/products/does-not-exist/original/inquiries",
        json={"name": "Bot Bot", "email": "bot@spam.com", "website": "http://spam"},
    )
    assert res.status_code == 201
    assert res.json() == {"ok": True}


def test_original_inquiry_missing_painting_404s():
    res = client.post(
        "/api/products/does-not-exist/original/inquiries",
        json={"name": "Real Buyer", "email": "buyer@example.com"},
    )
    assert res.status_code == 404


def test_get_original_missing_painting_404s():
    res = client.get("/api/products/does-not-exist/original")
    assert res.status_code == 404
