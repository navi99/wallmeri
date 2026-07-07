"""End-to-end MVP smoke test against a running API (mock payment mode).

Usage (local): docker compose exec api python scripts/smoke_mvp.py
Exercises: register → checkout → mock pay → stock decrement → admin ship/deliver
→ verified review → moderation → public rating → artist application pipeline.
"""
import os
import sys
import time

import httpx

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
    stock_before = c.get(f"/products/{product['slug']}").json()["stock"]

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

    # Idempotency: second verify must not decrement stock again.
    c.post("/checkout/verify", json={
        "order_id": order_id, "razorpay_order_id": "mock", "razorpay_payment_id": "mock_pay",
        "razorpay_signature": "mock_signature",
    })
    stock_after = c.get(f"/products/{product['slug']}").json()["stock"]
    check("stock decremented exactly once", stock_after == stock_before - 1,
          f"{stock_before} -> {stock_after}")

    # ── Review gate: not eligible before delivery ────────────────────────────
    r = c.get(f"/products/{product['slug']}/reviews/eligibility", headers=auth)
    check("review blocked before delivery",
          r.status_code == 200 and r.json()["can_review"] is False, r.text)

    # ── Admin ships and delivers ─────────────────────────────────────────────
    r = c.post("/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    check("admin login", r.status_code == 200, r.text)
    admin = {"Authorization": f"Bearer {r.json()['tokens']['access_token']}"}

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
