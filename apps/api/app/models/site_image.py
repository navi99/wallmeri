from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


# The known admin-configurable image spots on the storefront. A slot with
# max_images > 1 is an ordered gallery (e.g. the homepage hero crossfade);
# one with max_images == 1 is a single banner that's either set or empty —
# both are just SiteImage rows for the same slot, capped at a different
# length, so the admin UI and _apply_site_images (app.api.routes.admin) share
# one code path. Adding a new page's image spot is just a new registry entry
# + a seed row, no migration.
SITE_IMAGE_SLOTS: dict[str, dict[str, int | str]] = {
    "home_hero": {"label": "Homepage hero", "max_images": 6, "media": "image"},
    "home_hero_video": {"label": "Homepage hero video", "max_images": 1, "media": "video"},
    "home_why_wallmeri": {"label": 'Homepage "Why Wallmeri" image', "max_images": 1, "media": "image"},
    "about_hero": {"label": "About Us hero", "max_images": 1, "media": "image"},
    "cyo_showcase": {"label": "Create Your Own — showcase image", "max_images": 1, "media": "image"},
}


class SiteImage(Base):
    __tablename__ = "site_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    slot: Mapped[str] = mapped_column(String(60), nullable=False, index=True)
    # Order within the slot; 0 is first/main. Reassigned 0..N-1 on every save
    # of the slot — see _apply_site_images.
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    image_url: Mapped[str] = mapped_column(String(500), nullable=False, default="")

    # Set only for admin-uploaded images; NULL for pasted external URLs (also
    # how the initial seed rows are stored — see migration 0011).
    image_id: Mapped[int | None] = mapped_column(
        ForeignKey("media_assets.id", ondelete="SET NULL"), nullable=True
    )
    image: Mapped["MediaAsset | None"] = relationship()  # noqa: F821

    alt_text: Mapped[str] = mapped_column(String(300), nullable=False, default="")

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
