# Wallmeri — Premium Metal Wall Art Marketplace

India-focused, curated marketplace for premium metal wall art. Customers browse
**by category or by artist**, buy via Razorpay (guest checkout supported), and leave
**verified-purchase reviews**. Artists are onboarded manually by the Wallmeri team
(intake form → verification checklist → artist page); all art/image management is
done by admins. Sign in with email/password or Google.

References: [displate.com](https://displate.com), [metalposters.com](https://metalposters.com).
Product backlog: [docs/backlog/](docs/backlog/) (active plan: [MVP.md](docs/backlog/MVP.md)).

## Stack

| Layer    | Tech |
|----------|------|
| Web      | Next.js 14 (App Router) · React · TypeScript · Tailwind CSS · TanStack Query · Zustand |
| API      | FastAPI · SQLAlchemy 2 · Alembic · Pydantic v2 |
| Database | PostgreSQL 16 |
| Payments | Razorpay (with a local **mock mode** when keys are absent) |
| Auth     | Email/password + JWT · optional **Google sign-in** |
| Images   | S3-compatible object storage (R2/S3) with local-disk dev fallback |
| Email    | SMTP (any provider) with console-log dev fallback |
| Infra    | Docker Compose · Render Blueprint (`render.yaml`) |

Monorepo layout:

```
apps/
  web/   # Next.js storefront + admin
  api/   # FastAPI backend
docker-compose.yml
.env / .env.example
```

## Quick start (Docker)

1. Copy environment defaults:

   ```bash
   cp .env.example .env
   ```

   The defaults work out of the box. Razorpay keys are optional (see below).

2. Build and start everything:

   ```bash
   docker compose up --build
   ```

   On first boot the API container waits for Postgres, runs Alembic migrations,
   and seeds demo data (admin user, categories, 2 artists, ~12 posters).

3. Open:

   - Storefront: <http://localhost:3000>
   - API docs (Swagger): <http://localhost:8000/docs>
   - API health: <http://localhost:8000/health>

## What's in the MVP

- **Browse two ways** — by category (`/category/[slug]`, multi-tag posters) or by
  artist (`/artists` directory → artist pages). Guest browsing throughout.
- **Artists, curated** — `/artists/join` intake form → admin pipeline
  (new/contacted/onboarded/rejected) → artist record with a verification checklist
  that must be complete before the artist can go live.
- **Admin console** (`/admin`) — posters (image upload, category tags, artist
  attribution), categories, artists, applications, orders (paid → shipped →
  delivered with tracking + emails), review moderation.
- **Checkout** — Razorpay (or mock mode), idempotent payment confirmation, order
  confirmation email, guest order tracking at `/track`. Posters are made to
  order, so there is no inventory to reserve.
- **Reviews** — verified purchase only (delivered orders), admin-moderated,
  star ratings across the storefront.
- **Auth** — email/password + optional Google sign-in (auto-links to an existing
  account with the same email).

Optional integrations (all degrade gracefully when unconfigured — see
`.env.example`): Google sign-in, S3/R2 image storage, SMTP email, Razorpay.

## Default admin account

Seeded automatically (configurable in `.env`):

- Email: `admin@wallmeri.in`
- Password: `admin12345`

Log in, then visit **/admin** to manage products and view orders.

## Payments

- **Without Razorpay keys** (default): checkout runs in **mock mode** — orders are
  created and marked paid without a real gateway, so you can test the full flow locally.
- **With Razorpay test keys**: set these in `.env` and restart:

  ```
  RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
  RAZORPAY_KEY_SECRET=xxxxxxxx
  RAZORPAY_WEBHOOK_SECRET=xxxxxxxx   # optional, for webhook verification
  ```

  The real Razorpay Checkout popup will open, and the server verifies the payment
  signature before marking the order paid.

## Common commands

```bash
docker compose up --build      # start (build images)
docker compose up              # start (reuse images)
docker compose down            # stop
docker compose down -v         # stop and wipe the database volume
docker compose logs -f api     # tail API logs

# Re-run the seed manually
docker compose exec api python -m app.seed

# Run API unit tests / end-to-end smoke test
docker compose exec api pytest
docker compose exec api python scripts/smoke_mvp.py

# Create a new migration after model changes
docker compose exec api alembic revision --autogenerate -m "describe change"
docker compose exec api alembic upgrade head
```

## Deploying to Render

The repo is a ready-to-deploy Render Blueprint (`render.yaml`): managed Postgres +
API + web. Full step-by-step instructions — including configuring the object store
(Cloudflare R2 / S3 / persistent disk), Google OAuth, SMTP, and Razorpay webhooks —
are in **[docs/DEPLOY.md](docs/DEPLOY.md)**.

The short version: push to GitHub → Render → *New → Blueprint* → fill in the
secret env vars (`JWT_SECRET`, a strong `ADMIN_PASSWORD` — the production seed
refuses the default — Razorpay keys, and optional S3/Google/SMTP values) → deploy.
