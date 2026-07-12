"""Drop products.stock — every product is made to order

Wallmeri prints sublimation-on-steel per order, so there is no finite inventory
to track, reserve, or decrement. The column, its checkout validation, and the
atomic decrement at payment confirmation are all removed.

Revision ID: 0003_drop_product_stock
Revises: 0002_mvp_artists_reviews
Create Date: 2026-07-12

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0003_drop_product_stock"
down_revision: Union[str, None] = "0002_mvp_artists_reviews"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column("products", "stock")


def downgrade() -> None:
    # Recreate as NOT NULL: backfill existing rows via server_default, then drop
    # the default so the column matches its original 0001 definition.
    op.add_column(
        "products",
        sa.Column("stock", sa.Integer(), nullable=False, server_default="100"),
    )
    op.alter_column("products", "stock", server_default=None)
