"""Site images: admin-configurable hero/banner spots on the storefront

Introduces site_images, an ordered-gallery-per-slot table (see
app.models.site_image.SITE_IMAGE_SLOTS) mirroring the product-gallery
pattern: each row is one image at one position within a named slot
("home_hero", "home_why_wallmeri", "about_hero"). A slot capped at 1 image
is just a gallery of length <= 1 — same code path as the multi-image
homepage hero crossfade.

Seeds the 3 known slots with the Unsplash placeholder URLs that were
previously hardcoded in apps/web/app/page.tsx and apps/web/app/about/page.tsx,
so the storefront looks identical immediately after migrating; admins can
replace them from the new "Site content" admin tab.

Revision ID: 0011_site_images
Revises: 0010_category_poster_image
Create Date: 2026-07-21

"""
from datetime import datetime, timezone
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0011_site_images"
down_revision: Union[str, None] = "0010_category_poster_image"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

site_images = sa.table(
    "site_images",
    sa.column("slot", sa.String),
    sa.column("position", sa.Integer),
    sa.column("image_url", sa.String),
    sa.column("alt_text", sa.String),
    sa.column("created_at", sa.DateTime),
)

SEED_ROWS = [
    {
        "slot": "home_hero",
        "position": 0,
        "image_url": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=880&q=80",
        "alt_text": "Framed art glowing on a dark living-room wall, lit like a gallery",
    },
    {
        "slot": "home_hero",
        "position": 1,
        "image_url": "https://images.unsplash.com/photo-1554907984-15263bfd63bd?auto=format&fit=crop&w=880&q=80",
        "alt_text": "A single framed print hung on a bright, quiet wall",
    },
    {
        "slot": "home_hero",
        "position": 2,
        "image_url": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=880&q=80",
        "alt_text": "Wall art anchoring a warm contemporary living room",
    },
    {
        "slot": "home_why_wallmeri",
        "position": 0,
        "image_url": "https://images.unsplash.com/photo-1531913764164-f85c52e6e654?auto=format&fit=crop&w=900&q=80",
        "alt_text": "Bold, colour-saturated abstract artwork, the kind of piece Wallmeri prints on metal",
    },
    {
        "slot": "about_hero",
        "position": 0,
        "image_url": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=920&q=80",
        "alt_text": "A single framed metal print anchoring a warm, modern living room",
    },
]


def upgrade() -> None:
    op.execute("ALTER TYPE media_kind ADD VALUE IF NOT EXISTS 'site'")

    op.create_table(
        "site_images",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("slot", sa.String(length=60), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("image_url", sa.String(length=500), nullable=False, server_default=""),
        sa.Column("image_id", sa.Integer(), nullable=True),
        sa.Column("alt_text", sa.String(length=300), nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_site_images_slot", "site_images", ["slot"])
    op.create_foreign_key(
        "fk_site_images_image_id",
        "site_images",
        "media_assets",
        ["image_id"],
        ["id"],
        ondelete="SET NULL",
    )

    now = datetime.now(timezone.utc)
    op.bulk_insert(
        site_images,
        [{**row, "created_at": now} for row in SEED_ROWS],
    )


def downgrade() -> None:
    op.drop_constraint("fk_site_images_image_id", "site_images", type_="foreignkey")
    op.drop_index("ix_site_images_slot", table_name="site_images")
    op.drop_table("site_images")
    # media_kind: Postgres can't drop a single enum value; left in place (see 0006).
