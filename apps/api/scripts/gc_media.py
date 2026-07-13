"""Delete uploaded images that were never attached to a product/artist.

An upload (POST /admin/uploads) writes files and a `media_assets` row right
away, before the admin has saved the product/artist form that would reference
it — closing the form without saving leaves that row (and its three files)
behind. This sweeps rows still unattached after a grace period (default 24h).

Usage (local): docker compose exec api python scripts/gc_media.py
Intended to run on a schedule (cron/Render cron job) in production.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.database import SessionLocal  # noqa: E402
from app.services import custom_upload_service, media_service  # noqa: E402


def main() -> None:
    db = SessionLocal()
    try:
        count = media_service.sweep_unattached(db)
        print(f"Deleted {count} unattached media asset(s).")
        draft_count = custom_upload_service.sweep_drafts(db)
        print(f"Deleted {draft_count} abandoned custom-upload draft(s).")
    finally:
        db.close()


if __name__ == "__main__":
    main()
