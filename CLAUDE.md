# Wallmeri

Curated, India-only marketplace for premium metal wall art. Monorepo: `apps/web` (Next.js 14 App Router + Tailwind) and `apps/api` (FastAPI + SQLAlchemy 2 + Postgres). See README.md for setup and commands.

## Design Context

Before any UI work, read **PRODUCT.md** (strategy: register, users, brand personality, anti-references, design principles) and **DESIGN.md** (visual system: tokens, typography, components, named rules). Key points:

- **Register:** brand — the storefront is expressive and art-first; admin/checkout are quiet product surfaces.
- **North Star:** "The Steel Gallery" — Cotton (#FAF9F6) canvas, Noir Black (#1B1717) frame, Premium Red (#B32624) used sparingly (≤10% of a transactional screen; drenched only on the narrative hero bands).
- **Type:** Archivo everywhere (headings bold-uppercase-tracked); Cormorant Garamond only as italic accents (emphasized heading phrases, numerals, quotes). Sharp edges — radius 0 except avatars/count dots.
- **Never:** discount-marketplace clutter, SaaS-minimal clichés, craft/artisan twee, #FFFFFF/#000000, Cormorant in UI chrome.
- Accessibility bar: WCAG 2.1 AA, reduced-motion alternatives, mobile-first India.

## Data Consistency (React Query)

The same server records (orders, products, reviews, etc.) are read by multiple pages/tabs under different `queryKey`s — e.g. an order is cached separately as `["my-orders"]`, `["order", id, email]`, and `["admin-orders"]`. Any mutation that changes a record must invalidate **every** query key that surfaces that record, not just the tab it was triggered from — otherwise another page/tab shows stale data until its `staleTime` (30s) lapses or the user manually refreshes. `invalidateQueries({ queryKey: [...] })` does prefix matching by default, so invalidating `["order"]` also covers `["order", id, email]`. When adding a new mutation, check `queryKey` in `apps/web/lib/api.ts` callers to find every query key touching that resource and invalidate them all.
