"""Poster size price deltas for regular catalog products

Product.price_inr is always quoted for the A3 size. Rather than pricing a
sized product line at the size's own absolute price_inr (which belongs to
the "Create your own" custom-upload pricing model and is shared across every
product), a product line's price is now `product.price_inr + size.delta_inr`
— see app.services.pricing.compute_quote.

Backfills delta_inr from each size's existing price_inr, relative to A3's
price_inr, so today's effective per-size prices are unchanged for the
default/seed catalog until an admin adjusts the deltas directly.

Revision ID: 0008_poster_size_delta
Revises: 0007_product_size_code
Create Date: 2026-07-13

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0008_poster_size_delta"
down_revision: Union[str, None] = "0007_product_size_code"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "poster_sizes", sa.Column("delta_inr", sa.Integer(), nullable=False, server_default="0")
    )
    op.execute(
        """
        UPDATE poster_sizes
        SET delta_inr = price_inr - (SELECT price_inr FROM poster_sizes WHERE code = 'A3')
        """
    )
    op.alter_column("poster_sizes", "delta_inr", server_default=None)


def downgrade() -> None:
    op.drop_column("poster_sizes", "delta_inr")
