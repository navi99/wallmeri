"""Category display poster: admin-managed image shown on "shop by category" tiles

Mirrors Artist.avatar_id/avatar_url — a nullable FK to media_assets plus a
plain URL column, so pasted URLs and admin uploads both work and empty stays
a valid state (storefront falls back to a gradient tile).

Revision ID: 0010_category_poster_image
Revises: 0009_rebase_size_delta_a4
Create Date: 2026-07-21

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0010_category_poster_image"
down_revision: Union[str, None] = "0009_rebase_size_delta_a4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE media_kind ADD VALUE IF NOT EXISTS 'category'")

    op.add_column(
        "categories",
        sa.Column("poster_image_url", sa.String(length=500), nullable=False, server_default=""),
    )
    op.add_column("categories", sa.Column("poster_image_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_categories_poster_image_id",
        "categories",
        "media_assets",
        ["poster_image_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_index("ix_categories_poster_image_id", "categories", ["poster_image_id"])


def downgrade() -> None:
    op.drop_index("ix_categories_poster_image_id", table_name="categories")
    op.drop_constraint("fk_categories_poster_image_id", "categories", type_="foreignkey")
    op.drop_column("categories", "poster_image_id")
    op.drop_column("categories", "poster_image_url")
    # media_kind: Postgres can't drop a single enum value; left in place (see 0006).
