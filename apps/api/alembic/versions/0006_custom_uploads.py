"""Custom poster upload: poster_sizes, custom_uploads, order review state

Introduces the "Create your own" workflow (see docs/backlog/E10-custom-upload.md):
customers upload a photo, crop it to an admin-managed size, and check out
through the *existing* cart/order pipeline. A paid order that contains any
custom line is held in the new 'in_review' status for admin moderation
(IP / prohibited content) before it can proceed to normal fulfilment —
see app.services.order_service.mark_order_paid and
app.api.routes.admin's custom-review endpoints.

- poster_sizes: admin-managed size -> price table. Seeded with A4/A3/A2;
  only A3 is enabled at launch (per product decision). Prices are launch
  placeholders, editable from /admin without a migration.
- custom_uploads: one row per cropped custom design (FK to the underlying
  media_assets original), independent of any order until checkout attaches it.
- order_items.custom_upload_id: nullable FK so a line is either a catalog
  line (product_id set) or a custom line (custom_upload_id set) — mirrors
  the existing nullable product_id snapshot pattern, no parallel item table.

Revision ID: 0006_custom_uploads
Revises: 0005_product_images
Create Date: 2026-07-13

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0006_custom_uploads"
down_revision: Union[str, None] = "0005_product_images"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── Enum extensions ──────────────────────────────────────────────────────
    # PG 12+ allows ADD VALUE in a transaction as long as the value isn't used
    # in the same transaction (see 0002's precedent) — we only add them here.
    op.execute("ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'in_review'")
    op.execute("ALTER TYPE media_kind ADD VALUE IF NOT EXISTS 'custom'")

    # ── Poster sizes (admin-managed size -> price table) ────────────────────
    op.create_table(
        "poster_sizes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("code", sa.String(length=20), nullable=False),
        sa.Column("label", sa.String(length=80), nullable=False),
        sa.Column("width_cm", sa.Numeric(5, 1), nullable=False),
        sa.Column("height_cm", sa.Numeric(5, 1), nullable=False),
        sa.Column("price_inr", sa.Integer(), nullable=False),
        sa.Column("is_enabled", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("position", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_poster_sizes_code", "poster_sizes", ["code"], unique=True)

    op.execute(
        """
        INSERT INTO poster_sizes (code, label, width_cm, height_cm, price_inr, is_enabled, position, created_at)
        VALUES
            ('A4', 'A4 (21 x 29.7 cm)', 21.0, 29.7, 1499, false, 0, now()),
            ('A3', 'A3 (29.7 x 42 cm)', 29.7, 42.0, 2499, true, 1, now()),
            ('A2', 'A2 (42 x 59.4 cm)', 42.0, 59.4, 3999, false, 2, now())
        """
    )

    # ── Custom uploads (one row per cropped custom design) ──────────────────
    op.create_table(
        "custom_uploads",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("media_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("size_code", sa.String(length=20), nullable=False),
        sa.Column(
            "orientation",
            postgresql.ENUM("portrait", "landscape", name="custom_orientation"),
            nullable=False,
        ),
        sa.Column("crop_x", sa.Integer(), nullable=False),
        sa.Column("crop_y", sa.Integer(), nullable=False),
        sa.Column("crop_width", sa.Integer(), nullable=False),
        sa.Column("crop_height", sa.Integer(), nullable=False),
        sa.Column("dpi", sa.Integer(), nullable=False),
        sa.Column("price_inr", sa.Integer(), nullable=False),
        sa.Column("preview_key", sa.String(length=300), nullable=False),
        sa.Column(
            "status",
            postgresql.ENUM("draft", "ordered", name="custom_upload_status"),
            nullable=False,
            server_default="draft",
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["media_id"], ["media_assets.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_custom_uploads_media_id", "custom_uploads", ["media_id"])
    op.create_index("ix_custom_uploads_user_id", "custom_uploads", ["user_id"])

    # ── Orders: review state for held custom orders ──────────────────────────
    op.add_column("orders", sa.Column("review_note", sa.String(500), nullable=False, server_default=""))
    op.add_column("orders", sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True))

    op.add_column("order_items", sa.Column("custom_upload_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_order_items_custom_upload_id",
        "order_items",
        "custom_uploads",
        ["custom_upload_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_index("ix_order_items_custom_upload_id", "order_items", ["custom_upload_id"])


def downgrade() -> None:
    op.drop_index("ix_order_items_custom_upload_id", table_name="order_items")
    op.drop_constraint("fk_order_items_custom_upload_id", "order_items", type_="foreignkey")
    op.drop_column("order_items", "custom_upload_id")

    op.drop_column("orders", "reviewed_at")
    op.drop_column("orders", "review_note")

    op.drop_index("ix_custom_uploads_user_id", table_name="custom_uploads")
    op.drop_index("ix_custom_uploads_media_id", table_name="custom_uploads")
    op.drop_table("custom_uploads")
    op.execute("DROP TYPE IF EXISTS custom_upload_status")
    op.execute("DROP TYPE IF EXISTS custom_orientation")

    op.drop_index("ix_poster_sizes_code", table_name="poster_sizes")
    op.drop_table("poster_sizes")

    # order_status / media_kind: Postgres can't drop a single enum value, so
    # downgrade leaves 'in_review' / 'custom' in place (harmless, unused once
    # the tables above are gone) — same tradeoff 0002 accepted for shipped/
    # delivered/refunded.
