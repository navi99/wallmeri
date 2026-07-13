"""End-to-end MVP smoke test against a running API (mock payment mode).

Usage (local): docker compose exec api python scripts/smoke_mvp.py
Exercises: register → checkout → mock pay → idempotent confirm → admin ship/deliver
→ verified review → moderation → public rating → artist application pipeline.
"""
import io
import os
import sys
import time

import httpx
from PIL import Image

BASE = os.environ.get("SMOKE_BASE_URL", "http://localhost:8000/api")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@wallmeri.in")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin12345")

failures: list[str] = []


def check(name: str, cond: bool, detail: str = "") -> None:
    mark = "PASS" if cond else "FAIL"
    print(f"[{mark}] {name}" + (f" — {detail}" if detail and not cond else ""))
    if not cond:
        failures.append(name)


def main() -> None:
    c = httpx.Client(base_url=BASE, timeout=30)
    stamp = int(time.time())
    email = f"smoke+{stamp}@example.com"

    # ── Customer registers and buys ──────────────────────────────────────────
    r = c.post("/auth/register", json={"email": email, "password": "smoketest123", "full_name": "Smoke Tester"})
    check("register", r.status_code == 201, r.text)
    token = r.json()["tokens"]["access_token"]
    auth = {"Authorization": f"Bearer {token}"}

    product = c.get("/products?page_size=1").json()["items"][0]

    r = c.post(
        "/checkout/create-payment",
        headers=auth,
        json={
            "email": email,
            "items": [{"product_id": product["id"], "qty": 1}],
            "shipping_address": {
                "full_name": "Smoke Tester", "phone": "9999999999",
                "line1": "1 Test Lane", "line2": "", "city": "Chennai",
                "state": "TN", "pincode": "600001",
            },
        },
    )
    check("create-payment (mock)", r.status_code == 200 and r.json()["mock"] is True, r.text)
    order_id = r.json()["order_id"]

    r = c.post("/checkout/verify", json={
        "order_id": order_id, "razorpay_order_id": "mock", "razorpay_payment_id": "mock_pay",
        "razorpay_signature": "mock_signature",
    })
    check("verify payment", r.status_code == 200 and r.json()["status"] == "paid", r.text)

    # Idempotency: replaying verify (webhook + client race) must be a no-op, not
    # a second transition. Products are made to order, so the observable is the
    # order's own state — it stays paid, and paid_at doesn't move.
    paid_at = c.get(f"/orders/{order_id}", headers=auth).json()["paid_at"]
    r = c.post("/checkout/verify", json={
        "order_id": order_id, "razorpay_order_id": "mock", "razorpay_payment_id": "mock_pay",
        "razorpay_signature": "mock_signature",
    })
    check("replayed verify is idempotent", r.status_code == 200, r.text)
    replayed = c.get(f"/orders/{order_id}", headers=auth).json()
    check("order paid exactly once",
          replayed["status"] == "paid" and replayed["paid_at"] == paid_at,
          f"{paid_at} -> {replayed['paid_at']} ({replayed['status']})")

    # ── Review gate: not eligible before delivery ────────────────────────────
    r = c.get(f"/products/{product['slug']}/reviews/eligibility", headers=auth)
    check("review blocked before delivery",
          r.status_code == 200 and r.json()["can_review"] is False, r.text)

    # ── Admin ships and delivers ─────────────────────────────────────────────
    r = c.post("/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    check("admin login", r.status_code == 200, r.text)
    admin = {"Authorization": f"Bearer {r.json()['tokens']['access_token']}"}

    # ── Product image gallery (1 main + up to 5 more) ────────────────────────
    def upload_image(color: str) -> dict:
        buf = io.BytesIO()
        Image.new("RGB", (300, 400), color).save(buf, format="PNG")
        files = {"file": (f"{color}.png", buf.getvalue(), "image/png")}
        resp = c.post("/admin/uploads", headers=admin, files=files, data={"kind": "product"})
        check(f"upload gallery image ({color})", resp.status_code == 200, resp.text)
        return resp.json()

    cat_id = c.get("/categories").json()[0]["id"]
    img_a, img_b, img_c = (upload_image(color) for color in ("red", "green", "blue"))

    r = c.post("/admin/products", headers=admin, json={
        "title": f"Gallery Test {stamp}", "price_inr": 999,
        "image_ids": [img_a["id"], img_b["id"], img_c["id"]],
        "category_ids": [cat_id], "is_active": True,
    })
    check("create product with 3-image gallery", r.status_code == 201, r.text)
    gallery_product = r.json()
    gallery_id = gallery_product["id"]
    check("gallery images in upload order",
          [i["image_id"] for i in gallery_product["images"]] == [img_a["id"], img_b["id"], img_c["id"]],
          gallery_product)
    check("main image is the first gallery image",
          gallery_product["image_id"] == img_a["id"] and gallery_product["image_url"] == img_a["image_url"],
          gallery_product)

    r = c.patch(f"/admin/products/{gallery_id}", headers=admin,
                json={"image_ids": [img_b["id"], img_a["id"], img_c["id"]]})
    check("reorder gallery", r.status_code == 200, r.text)
    reordered = r.json()
    check("reorder flips the main image", reordered["image_id"] == img_b["id"], reordered)

    r = c.patch(f"/admin/products/{gallery_id}", headers=admin,
                json={"image_ids": [img_b["id"], img_a["id"]]})
    check("remove an image from the gallery", r.status_code == 200, r.text)
    check("gallery has 2 images after removal", len(r.json()["images"]) == 2, r.text)

    extra = [upload_image(c2)["id"] for c2 in ("yellow", "purple", "black", "white", "gray")]
    r = c.patch(f"/admin/products/{gallery_id}", headers=admin,
                json={"image_ids": [img_a["id"], img_b["id"]] + extra})
    check("more than 6 images rejected", r.status_code == 400, r.text)

    r = c.delete(f"/admin/products/{gallery_id}", headers=admin)
    check("delete gallery product", r.status_code == 204, r.text)
    remaining = c.get("/admin/products", headers=admin).json()
    check("deleted product no longer listed", all(p["id"] != gallery_id for p in remaining))

    # ── Custom poster upload (guest, no auth) ────────────────────────────────
    def upload_custom(width: int, height: int, color: str) -> dict:
        buf = io.BytesIO()
        Image.new("RGB", (width, height), color).save(buf, format="PNG")
        files = {"file": (f"{color}.png", buf.getvalue(), "image/png")}
        resp = c.post("/custom/uploads", files=files)
        check(f"custom upload ({width}x{height})", resp.status_code == 200, resp.text)
        return resp.json()

    def custom_item(media_id: int, size_code: str, orientation: str, crop: dict) -> httpx.Response:
        return c.post("/custom/items", json={
            "media_id": media_id, "size_code": size_code, "orientation": orientation, "crop": crop,
        })

    sizes = c.get("/custom/sizes").json()
    check("only enabled sizes listed", {s["code"] for s in sizes} == {"A3"}, sizes)

    # 2000x2800 comfortably clears A3-portrait's 150 DPI bar (~171x169 DPI).
    photo = upload_custom(2000, 2800, "orange")
    r = custom_item(photo["id"], "A3", "portrait", {"x": 0, "y": 0, "width": 2000, "height": 2800})
    check("custom item created (good DPI)", r.status_code == 200, r.text)
    good_item = r.json()
    check("dpi band ok", good_item["dpi_band"] == "ok" and good_item["dpi"] >= 150, good_item)
    check("price from PosterSize", good_item["price_inr"] == 2499, good_item)

    r = custom_item(photo["id"], "A3", "portrait", {"x": 0, "y": 0, "width": 60, "height": 84})
    check("tiny crop rejected (<100 DPI)", r.status_code == 400, r.text)

    r = custom_item(photo["id"], "A4", "portrait", {"x": 0, "y": 0, "width": 2000, "height": 2800})
    check("disabled size rejected", r.status_code == 400, r.text)

    r = c.post("/checkout/quote", json={"items": [{"custom_upload_id": good_item["custom_upload_id"], "qty": 1}]})
    check("quote incl. custom line", r.status_code == 200 and r.json()["subtotal_inr"] == 2499, r.text)
    check("quote line kind is custom", r.json()["lines"][0]["kind"] == "custom", r.text)

    # Mixed cart: one catalog product + one custom line in the same order.
    mix_photo = upload_custom(2000, 2800, "teal")
    mix_item = custom_item(mix_photo["id"], "A3", "portrait", {"x": 0, "y": 0, "width": 2000, "height": 2800}).json()
    r = c.post("/checkout/quote", json={"items": [
        {"product_id": product["id"], "qty": 1},
        {"custom_upload_id": mix_item["custom_upload_id"], "qty": 1},
    ]})
    check("mixed-cart quote has both lines", r.status_code == 200 and len(r.json()["lines"]) == 2, r.text)

    guest_a = f"smoke-custom-a+{stamp}@example.com"
    ship_addr = {
        "full_name": "Custom Buyer", "phone": "9999999998",
        "line1": "2 Test Lane", "line2": "", "city": "Chennai", "state": "TN", "pincode": "600002",
    }
    r = c.post("/checkout/create-payment", json={
        "email": guest_a,
        "items": [{"product_id": product["id"], "qty": 1}, {"custom_upload_id": mix_item["custom_upload_id"], "qty": 1}],
        "shipping_address": ship_addr,
    })
    check("mixed-cart guest checkout (mock)", r.status_code == 200, r.text)
    mixed_order_id = r.json()["order_id"]
    c.post("/checkout/verify", json={
        "order_id": mixed_order_id, "razorpay_order_id": "mock", "razorpay_payment_id": "mock_pay",
        "razorpay_signature": "mock_signature",
    })
    mixed_order = c.get(f"/orders/{mixed_order_id}", params={"email": guest_a}).json()
    check("mixed order (w/ custom line) held in_review", mixed_order["status"] == "in_review", mixed_order)
    r = c.post(f"/admin/orders/{mixed_order_id}/custom-review", headers=admin, json={"action": "approve", "note": "ok"})
    check("approve mixed order -> paid", r.status_code == 200 and r.json()["status"] == "paid", r.text)

    # Approve path (custom-only order).
    guest_b = f"smoke-custom-b+{stamp}@example.com"
    r = c.post("/checkout/create-payment", json={
        "email": guest_b,
        "items": [{"custom_upload_id": good_item["custom_upload_id"], "qty": 1}],
        "shipping_address": ship_addr,
    })
    check("custom-only guest checkout (mock)", r.status_code == 200, r.text)
    approve_order_id = r.json()["order_id"]
    c.post("/checkout/verify", json={
        "order_id": approve_order_id, "razorpay_order_id": "mock", "razorpay_payment_id": "mock_pay",
        "razorpay_signature": "mock_signature",
    })
    approve_order = c.get(f"/orders/{approve_order_id}", params={"email": guest_b}).json()
    check("custom order held in_review", approve_order["status"] == "in_review", approve_order)

    r = c.get("/admin/custom-review", headers=admin)
    check("order visible in custom-review queue", any(o["id"] == approve_order_id for o in r.json()), r.text)
    queued = next(o for o in r.json() if o["id"] == approve_order_id)
    check("queue entry has the custom line", len(queued["custom_lines"]) == 1 and queued["custom_lines"][0]["dpi_band"] == "ok", queued)

    r = c.patch(f"/admin/orders/{approve_order_id}/status", headers=admin, json={"status": "paid"})
    check("generic status endpoint blocked while in_review", r.status_code == 400, r.text)

    r = c.post(f"/admin/orders/{approve_order_id}/custom-review", headers=admin, json={"action": "approve", "note": "Looks good"})
    check("admin approves custom order", r.status_code == 200 and r.json()["status"] == "paid", r.text)

    r = c.get(f"/admin/custom-items/{good_item['custom_upload_id']}/print-file", headers=admin)
    check("print-file downloadable after approval", r.status_code == 200 and r.headers["content-type"] == "image/jpeg", r.status_code)

    draft_photo = upload_custom(2000, 2800, "gray")
    draft_item = custom_item(draft_photo["id"], "A3", "portrait", {"x": 0, "y": 0, "width": 2000, "height": 2800}).json()
    r = c.get(f"/admin/custom-items/{draft_item['custom_upload_id']}/print-file", headers=admin)
    check("print-file 404 for a never-ordered draft", r.status_code == 404, r.text)

    # Reject path (with the required-reason guard).
    guest_c = f"smoke-custom-c+{stamp}@example.com"
    reject_photo = upload_custom(2000, 2800, "purple")
    reject_item = custom_item(reject_photo["id"], "A3", "portrait", {"x": 0, "y": 0, "width": 2000, "height": 2800}).json()
    r = c.post("/checkout/create-payment", json={
        "email": guest_c,
        "items": [{"custom_upload_id": reject_item["custom_upload_id"], "qty": 1}],
        "shipping_address": ship_addr,
    })
    reject_order_id = r.json()["order_id"]
    c.post("/checkout/verify", json={
        "order_id": reject_order_id, "razorpay_order_id": "mock", "razorpay_payment_id": "mock_pay",
        "razorpay_signature": "mock_signature",
    })

    r = c.post(f"/admin/orders/{reject_order_id}/custom-review", headers=admin, json={"action": "reject", "note": ""})
    check("reject without a reason is rejected", r.status_code == 400, r.text)

    r = c.post(f"/admin/orders/{reject_order_id}/custom-review", headers=admin,
               json={"action": "reject", "note": "Trademarked character artwork"})
    check("admin rejects custom order -> refunded", r.status_code == 200 and r.json()["status"] == "refunded", r.text)

    r = c.post(f"/admin/orders/{reject_order_id}/custom-review", headers=admin, json={"action": "approve", "note": "too late"})
    check("re-reviewing a resolved order is rejected", r.status_code == 400, r.text)

    r = c.get(f"/admin/custom-items/{reject_item['custom_upload_id']}/print-file", headers=admin)
    check("print-file still downloadable for a refunded (but ordered) design", r.status_code == 200, r.text)

    r = c.patch(f"/admin/orders/{order_id}/status", headers=admin,
                json={"status": "delivered"})
    check("illegal transition rejected (paid->delivered)", r.status_code == 400, r.text)

    r = c.patch(f"/admin/orders/{order_id}/status", headers=admin,
                json={"status": "shipped", "courier_name": "Delhivery", "tracking_number": "AWB123"})
    check("paid -> shipped", r.status_code == 200 and r.json()["status"] == "shipped", r.text)
    r = c.patch(f"/admin/orders/{order_id}/status", headers=admin, json={"status": "delivered"})
    check("shipped -> delivered", r.status_code == 200 and r.json()["status"] == "delivered", r.text)

    # ── Verified review + moderation ─────────────────────────────────────────
    r = c.get(f"/products/{product['slug']}/reviews/eligibility", headers=auth)
    check("eligible after delivery", r.json().get("can_review") is True, r.text)
    r = c.post(f"/products/{product['slug']}/reviews", headers=auth,
               json={"rating": 5, "title": "Stunning", "body": "Looks great on my wall."})
    check("review submitted (pending)", r.status_code == 201 and r.json()["status"] == "pending", r.text)
    review_id = r.json()["id"]

    public = c.get(f"/products/{product['slug']}/reviews").json()
    check("pending review hidden from public", all(rv["id"] != review_id for rv in public))

    r = c.patch(f"/admin/reviews/{review_id}", headers=admin, json={"status": "approved"})
    check("review approved", r.status_code == 200, r.text)
    prod = c.get(f"/products/{product['slug']}").json()
    check("rating aggregates on product", prod["rating_count"] >= 1 and prod["rating_avg"] is not None)

    # ── Guest order lookup ───────────────────────────────────────────────────
    r = c.get(f"/orders/{order_id}", params={"email": email})
    check("guest order lookup by id+email", r.status_code == 200, r.text)
    r = c.get(f"/orders/{order_id}", params={"email": "wrong@example.com"})
    check("guest lookup wrong email rejected", r.status_code == 403, r.text)

    # ── Artist application pipeline ──────────────────────────────────────────
    r = c.post("/artist-applications", json={
        "name": "Smoke Artist", "email": email, "phone": "", "portfolio_url": "",
        "pitch": "smoke pitch", "website": "",
    })
    check("artist application submitted", r.status_code == 201, r.text)
    apps = c.get("/admin/artist-applications", headers=admin).json()
    mine = next((a for a in apps if a["email"] == email), None)
    check("application visible to admin", mine is not None)
    if mine:
        r = c.patch(f"/admin/artist-applications/{mine['id']}", headers=admin,
                    json={"status": "contacted", "admin_note": "smoke"})
        check("application status updated", r.status_code == 200 and r.json()["status"] == "contacted", r.text)

    # ── Artist activation gate ───────────────────────────────────────────────
    r = c.post("/admin/artists", headers=admin, json={"name": f"Gate Test {stamp}"})
    artist_id = r.json()["id"]
    r = c.patch(f"/admin/artists/{artist_id}", headers=admin, json={"is_active": True})
    check("activation blocked without checklist", r.status_code == 400, r.text)
    r = c.patch(f"/admin/artists/{artist_id}", headers=admin, json={
        "identity_verified": True, "agreement_received": True, "contact_verified": True,
        "is_active": True,
    })
    check("activation allowed with checklist", r.status_code == 200 and r.json()["is_active"], r.text)
    c.patch(f"/admin/artists/{artist_id}", headers=admin, json={"is_active": False})

    print()
    if failures:
        print(f"{len(failures)} FAILURE(S): {failures}")
        sys.exit(1)
    print("All smoke checks passed.")


if __name__ == "__main__":
    main()
