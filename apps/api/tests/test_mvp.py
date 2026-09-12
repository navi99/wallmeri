"""Unit tests that don't need a live database.

Run inside the api container: docker compose exec api pytest
"""
import io

import pytest
from fastapi.testclient import TestClient
from PIL import Image
from pydantic import ValidationError

from app.main import app
from app.models import MAX_DISCOUNT_PERCENT, ORDER_TRANSITIONS, OrderStatus
from app.schemas.contact import CATEGORY_PATTERN, ContactEnquiryCreate
from app.schemas.discount import DiscountUpdate
from app.schemas.order import QuoteResponse
from app.services import discount, email_service, storage_service

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
    ("GET", "/api/admin/contact-enquiries"),
    ("PATCH", "/api/admin/contact-enquiries/1"),
    ("PUT", "/api/admin/products/1/original"),
    ("DELETE", "/api/admin/products/1/original"),
    ("GET", "/api/admin/discount"),
    ("PUT", "/api/admin/discount"),
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

        # Original is retained byte-for-byte (not re-encoded) - MVP S-M2.1.
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
        storage_service.delete_keys(keys)  # already gone - must not raise
        storage_service.delete_keys([])  # empty list - must not raise


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


class TestDiscountRounding:
    """apply() is mirrored in apps/web/lib/discount.ts - keep both in step."""

    def test_plain_percentages(self):
        assert discount.apply(1000, 10) == 900
        assert discount.apply(2499, 15) == 2124
        assert discount.apply(2799, 15) == 2379

    def test_rounds_half_up_not_bankers(self):
        # 110 @ 5% is exactly 104.5. Python's round() is banker's rounding and
        # would give 104, disagreeing with the browser's Math.round by a rupee.
        assert discount.apply(110, 5) == 105
        assert round(104.5) == 104  # the trap this guards against

    def test_zero_and_negative_percent_are_identity(self):
        assert discount.apply(2499, 0) == 2499
        assert discount.apply(2499, -5) == 2499

    def test_never_returns_a_free_item(self):
        # The 90% cap alone does not save a 1-rupee base: (1*10+50)//100 == 0.
        # A zero-rupee line means a free poster and, on a single-line cart, a
        # 0-paise order Razorpay rejects.
        assert discount.apply(1, MAX_DISCOUNT_PERCENT) == 1

    def test_non_positive_price_is_left_alone(self):
        assert discount.apply(0, 20) == 0

    @pytest.mark.parametrize("percent", [0, 1, 7, 15, 33, 50, MAX_DISCOUNT_PERCENT])
    def test_subtotal_invariant_holds(self, percent):
        """Discounting the unit price before multiplying by qty is what makes
        sum(line totals) == subtotal exact, with no rounding residue."""
        basket = [(2799, 2), (2599, 3), (1499, 1), (110, 7), (1, 4)]
        subtotal = sum(discount.apply(base, percent) * qty for base, qty in basket)
        lines = [discount.apply(base, percent) * qty for base, qty in basket]
        assert sum(lines) == subtotal


class TestDiscountSchema:
    def test_rejects_out_of_range_percent(self):
        with pytest.raises(ValidationError):
            DiscountUpdate(percent=MAX_DISCOUNT_PERCENT + 1)
        with pytest.raises(ValidationError):
            DiscountUpdate(percent=-1)

    def test_rejects_overlong_label(self):
        with pytest.raises(ValidationError):
            DiscountUpdate(percent=10, label="x" * 81)

    def test_defaults_are_the_no_discount_state(self):
        assert DiscountUpdate().model_dump() == {
            "percent": 0,
            "label": "",
            "is_active": False,
        }


def test_public_discount_route_is_registered():
    assert "/api/discount" in app.openapi()["paths"]


def test_quote_response_discount_fields_default_to_zero():
    """A response built without any discount data must look exactly like the
    pre-discount API, so historical/legacy consumers are unaffected."""
    res = QuoteResponse(lines=[], subtotal_inr=0, shipping_inr=0, total_inr=0)
    assert res.discount_percent == 0
    assert res.discount_label == ""
    assert res.discount_amount_inr == 0
    assert res.original_subtotal_inr == 0


class TestContactEnquirySchema:
    """The contact form's server-side guard rails. Pure schema checks - no DB,
    no rate-limit quota consumed."""

    def _valid(self, **overrides):
        base = {
            "category": "returns",
            "name": "Asha Rao",
            "email": "asha@example.com",
            "message": "My poster arrived with a dented corner.",
        }
        base.update(overrides)
        return ContactEnquiryCreate(**base)

    def test_accepts_a_realistic_enquiry(self):
        enquiry = self._valid()
        assert enquiry.category == "returns"
        assert enquiry.website == ""  # honeypot defaults empty

    def test_category_defaults_to_general(self):
        payload = ContactEnquiryCreate(
            name="Asha Rao", email="asha@example.com", message="A general question here."
        )
        assert payload.category == "general"

    def test_rejects_unknown_category(self):
        with pytest.raises(ValidationError):
            self._valid(category="refund-now")

    def test_rejects_one_word_message(self):
        # The 10-char floor: shorter than this is a bot or a mis-submit, never
        # a question anyone can answer.
        with pytest.raises(ValidationError):
            self._valid(message="help")

    def test_rejects_bad_email(self):
        with pytest.raises(ValidationError):
            self._valid(email="not-an-email")

    def test_rejects_overlong_message(self):
        with pytest.raises(ValidationError):
            self._valid(message="x" * 4001)


def test_every_contact_category_has_an_email_label():
    """A category the form can send but email_service can't name would leak a
    raw code into the team's inbox subject line."""
    allowed = set(CATEGORY_PATTERN.strip("^$()").split("|"))
    assert allowed == set(email_service.CONTACT_CATEGORY_LABELS)


def test_contact_enquiry_route_is_registered():
    assert "/api/contact-enquiries" in app.openapi()["paths"]


def test_contact_enquiry_rejects_invalid_payload_before_the_handler():
    # 422 comes from request validation, so no DB and no rate-limit quota.
    res = client.post("/api/contact-enquiries", json={"name": "x", "email": "nope"})
    assert res.status_code == 422


def test_contact_enquiry_honeypot_returns_ok_without_storing():
    res = client.post(
        "/api/contact-enquiries",
        json={
            "category": "general",
            "name": "Bot Bot",
            "email": "bot@spam.com",
            "message": "Buy cheap watches now.",
            "website": "http://spam",
        },
    )
    # Honeypot short-circuits before any DB access.
    assert res.status_code == 201
    assert res.json() == {"ok": True}
