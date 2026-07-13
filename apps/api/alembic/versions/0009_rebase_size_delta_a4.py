"""Re-base product size pricing on A4 instead of A3

Product decision: Product.price_inr is now always quoted for A4 (previously
A3) — A3 costs 1000 more, A2 costs 2000 more. Only the delta_inr values
change here; Product.price_inr rows are untouched (see
app.services.pricing.compute_quote, which just does
product.price_inr + size.delta_inr regardless of which size is the zero
point).

Revision ID: 0009_rebase_size_delta_a4
Revises: 0008_poster_size_delta
Create Date: 2026-07-13

"""
from typing import Sequence, Union

from alembic import op

revision: str = "0009_rebase_size_delta_a4"
down_revision: Union[str, None] = "0008_poster_size_delta"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("UPDATE poster_sizes SET delta_inr = 0 WHERE code = 'A4'")
    op.execute("UPDATE poster_sizes SET delta_inr = 1000 WHERE code = 'A3'")
    op.execute("UPDATE poster_sizes SET delta_inr = 2000 WHERE code = 'A2'")


def downgrade() -> None:
    op.execute(
        """
        UPDATE poster_sizes
        SET delta_inr = price_inr - (SELECT price_inr FROM poster_sizes WHERE code = 'A3')
        """
    )
