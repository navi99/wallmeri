"""Media assets: managed image uploads with retained originals + variants

Introduces media_assets, a registry of uploaded images (original + web +
thumbnail keys, dimensions, hash) that products/artists optionally reference
via a nullable FK. Existing image_url/avatar_url rows are untouched — they
keep serving pasted URLs and seeded picsum placeholders with a NULL FK; only
images uploaded through the admin form going forward get a row and are
eligible for lifecycle cleanup (see app.services.media_service).

Revision ID: 0004_media_assets
Revises: 0003_drop_product_stock
Create Date: 2026-07-12

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0004_media_assets"
down_revision: Union[str, None] = "0003_drop_product_stock"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    media_kind = postgresql.ENUM("product", "avatar", name="media_kind")
    media_kind.create(op.get_bind(), checkfirst=True)
    op.create_table(
        "media_assets",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "kind",
            postgresql.ENUM("product", "avatar", name="media_kind", create_type=False),
            nullable=False,
        ),
        sa.Column("original_key", sa.String(length=300), nullable=False),
        sa.Column("web_key", sa.String(length=300), nullable=False),
        sa.Column("thumb_key", sa.String(length=300), nullable=False),
        sa.Column("content_type", sa.String(length=60), nullable=False),
        sa.Column("width", sa.Integer(), nullable=False),
        sa.Column("height", sa.Integer(), nullable=False),
        sa.Column("size_bytes", sa.BigInteger(), nullable=False),
        sa.Column("content_hash", sa.String(length=64), nullable=False),
        sa.Column("attached", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_media_assets_content_hash", "media_assets", ["content_hash"])

    op.add_column("products", sa.Column("image_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_products_image_id", "products", "media_assets", ["image_id"], ["id"], ondelete="SET NULL"
    )
    op.create_index("ix_products_image_id", "products", ["image_id"])

    op.add_column("artists", sa.Column("avatar_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_artists_avatar_id", "artists", "media_assets", ["avatar_id"], ["id"], ondelete="SET NULL"
    )
    op.create_index("ix_artists_avatar_id", "artists", ["avatar_id"])


def downgrade() -> None:
    op.drop_index("ix_artists_avatar_id", table_name="artists")
    op.drop_constraint("fk_artists_avatar_id", "artists", type_="foreignkey")
    op.drop_column("artists", "avatar_id")

    op.drop_index("ix_products_image_id", table_name="products")
    op.drop_constraint("fk_products_image_id", "products", type_="foreignkey")
    op.drop_column("products", "image_id")

    op.drop_index("ix_media_assets_content_hash", table_name="media_assets")
    op.drop_table("media_assets")
    op.execute("DROP TYPE IF EXISTS media_kind")
