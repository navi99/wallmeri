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

    def test_stores_valid_png_locally(self, tmp_path, monkeypatch):
        from app.core.config import settings

        monkeypatch.setattr(settings, "UPLOADS_DIR", str(tmp_path))
        stored = storage_service.store_image(self._png_bytes(), "image/png")
        assert stored.image_url.endswith(".jpg")
        assert stored.thumb_url.endswith("_thumb.jpg")
        assert len(list(tmp_path.rglob("*.jpg"))) == 2


def test_intake_honeypot_returns_ok_without_storing():
    res = client.post(
        "/api/artist-applications",
        json={"name": "Bot Bot", "email": "bot@spam.com", "website": "http://spam"},
    )
    # Honeypot short-circuits before any DB access.
    assert res.status_code == 201
    assert res.json() == {"ok": True}
