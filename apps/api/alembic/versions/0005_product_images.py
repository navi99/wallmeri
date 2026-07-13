"""Product image gallery: ordered product_images backed by media_assets

Introduces product_images, an ordered per-product gallery (up to 6 images:
1 main + up to 5 more). Position 0 is always the main image — Product.image_url/
image_id keep meaning "the main image" and are kept in sync with position 0 by
app.api.routes.admin._sync_main_image on every save; every existing read path
(product cards, cart/order snapshots, thumb_url) is unaffected.

Existing products with a managed image_id get a single position-0 gallery row
so they render identically in the new gallery UI. Products with only a pasted
image_url (image_id NULL — seeds, external URLs) get no gallery row and keep
serving that URL directly, unchanged.

Revision ID: 0005_product_images
Revises: 0004_media_assets
Create Date: 2026-07-13

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0005_product_images"
down_revision: Union[str, None] = "0004_media_assets"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "product_images",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("image_id", sa.Integer(), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["image_id"], ["media_assets.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_product_images_product_id", "product_images", ["product_id"])

    op.execute(
        "INSERT INTO product_images (product_id, image_id, position, created_at) "
        "SELECT id, image_id, 0, now() FROM products WHERE image_id IS NOT NULL"
    )


def downgrade() -> None:
    op.drop_index("ix_product_images_product_id", table_name="product_images")
    op.drop_table("product_images")
