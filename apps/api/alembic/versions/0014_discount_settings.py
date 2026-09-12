"""Site-wide discount: admin-configurable festive/occasion percent off

Introduces discount_settings, a singleton row (id=1, see
app.models.discount.DISCOUNT_SETTINGS_ID) holding one whole-percent discount
plus the occasion label shown beside discounted prices. Seeded inactive at
0%, so migrating changes no price anywhere until an admin turns it on.

Also snapshots the discount onto orders. OrderItem.price_inr keeps storing
the price actually charged (now discounted when a sale is running), so
subtotal_inr stays the sum of the stored lines and every downstream reader -
emails, invoices, refunds off total_inr - needs no change. The new
original_subtotal_inr records what the same basket would have cost at list
price; existing orders are backfilled to equal subtotal_inr so they render
exactly as before.

Revision ID: 0014_discount_settings
Revises: 0013_fix_a3_dimensions
Create Date: 2026-09-12

"""
from datetime import datetime, timezone
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0014_discount_settings"
down_revision: Union[str, None] = "0013_fix_a3_dimensions"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

discount_settings = sa.table(
    "discount_settings",
    sa.column("id", sa.Integer),
    sa.column("percent", sa.Integer),
    sa.column("label", sa.String),
    sa.column("is_active", sa.Boolean),
    sa.column("updated_at", sa.DateTime),
)


def upgrade() -> None:
    op.create_table(
        "discount_settings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("percent", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("label", sa.String(length=80), nullable=False, server_default=""),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        # Mirrors app.models.discount.MAX_DISCOUNT_PERCENT. A last line of
        # defence under the API schema's ge/le: at <=90% every base price
        # of >=1 still rounds to a line of at least 1 rupee.
        sa.CheckConstraint("percent >= 0 AND percent <= 90", name="ck_discount_percent_range"),
    )

    # The singleton. Seeded inactive so the storefront is untouched until an
    # admin opts in from the Discount tab.
    op.bulk_insert(
        discount_settings,
        [
            {
                "id": 1,
                "percent": 0,
                "label": "",
                "is_active": False,
                "updated_at": datetime.now(timezone.utc),
            }
        ],
    )

    op.add_column(
        "orders",
        sa.Column("original_subtotal_inr", sa.Integer(), nullable=False, server_default="0"),
    )
    op.add_column(
        "orders",
        sa.Column("discount_percent", sa.Integer(), nullable=False, server_default="0"),
    )
    op.add_column(
        "orders",
        sa.Column("discount_label", sa.String(length=80), nullable=False, server_default=""),
    )

    # Pre-discount orders were never discounted, so list price == paid price.
    # Without this they'd report a bogus "you saved subtotal_inr".
    op.execute("UPDATE orders SET original_subtotal_inr = subtotal_inr")


def downgrade() -> None:
    op.drop_column("orders", "discount_label")
    op.drop_column("orders", "discount_percent")
    op.drop_column("orders", "original_subtotal_inr")
    op.drop_table("discount_settings")
