# Wallmeri — Premium Metal Wall Art Marketplace

India-focused marketplace for premium metal wall art and posters. Browse a catalog,
search, add to cart, check out with Razorpay, and track orders. Includes an admin area
for managing the product catalog.

Reference: [displate.com](https://displate.com).

## Stack

| Layer    | Tech |
|----------|------|
| Web      | Next.js 14 (App Router) · React · TypeScript · Tailwind CSS · TanStack Query · Zustand |
| API      | FastAPI · SQLAlchemy 2 · Alembic · Pydantic v2 |
| Database | PostgreSQL 16 |
| Payments | Razorpay (with a local **mock mode** when keys are absent) |
| Infra    | Docker Compose |

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
   and seeds demo data (admin user, categories, ~12 posters).

3. Open:

   - Storefront: <http://localhost:3000>
   - API docs (Swagger): <http://localhost:8000/docs>
   - API health: <http://localhost:8000/health>

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

# Create a new migration after model changes
docker compose exec api alembic revision --autogenerate -m "describe change"
docker compose exec api alembic upgrade head
```

## Deploying to Render (later)

- **Postgres**: create a managed Render Postgres; point the API's `POSTGRES_*` vars at it.
- **API**: deploy `apps/api` as a Web Service (Docker). Set env vars from `.env.example`.
  The entrypoint runs migrations + seed on boot.
- **Web**: deploy `apps/web` as a Web Service (Docker) or a static/SSR Next.js service;
  set `NEXT_PUBLIC_API_URL` to the deployed API URL (e.g. `https://wallmeri-api.onrender.com/api`).
- Set a strong `JWT_SECRET` and real Razorpay keys in production.
```
