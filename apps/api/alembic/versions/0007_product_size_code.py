"""Poster sizes for regular catalog products

Extends the size -> price picker already used by "Create your own" custom
uploads (see 0006_custom_uploads) to plain catalog products: shoppers now
pick a PosterSize on the product page too, and its price replaces the
product's flat price_inr for that line.

- order_items.size_code: nullable string snapshot (never a FK — mirrors
  custom_uploads.size_code) recording which size a *product* line was
  ordered at. Custom lines still carry their size via custom_upload_id and
  leave this column null.

Revision ID: 0007_product_size_code
Revises: 0006_custom_uploads
Create Date: 2026-07-13

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0007_product_size_code"
down_revision: Union[str, None] = "0006_custom_uploads"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("order_items", sa.Column("size_code", sa.String(length=20), nullable=True))


def downgrade() -> None:
    op.drop_column("order_items", "size_code")
