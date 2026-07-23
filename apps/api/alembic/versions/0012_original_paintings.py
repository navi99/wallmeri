"""Original paintings + inquiries: the "Buy Original" lead-capture feature

A product can optionally have a physical original painting for sale
alongside its metal-print reproduction (original_paintings, 1:1 via a unique
product_id). Buyers express interest via a public form; original_inquiries
holds those leads for the admin team to follow up on manually — no
payment/checkout is involved. Mirrors the artist_applications pattern
(app.models.artist.ArtistApplication) end to end.

Revision ID: 0012_original_paintings
Revises: 0011_site_images
Create Date: 2026-07-23

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0012_original_paintings"
down_revision: Union[str, None] = "0011_site_images"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    painting_status = postgresql.ENUM(
        "available", "reserved", "sold", name="original_painting_status"
    )
    painting_status.create(op.get_bind(), checkfirst=True)
    inquiry_status = postgresql.ENUM(
        "new", "contacted", "negotiating", "won", "lost", name="original_inquiry_status"
    )
    inquiry_status.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "original_paintings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "product_id",
            sa.Integer(),
            sa.ForeignKey("products.id", ondelete="CASCADE"),
            nullable=False,
            unique=True,
        ),
        sa.Column("medium", sa.String(length=160), nullable=False, server_default=""),
        sa.Column("width_cm", sa.Numeric(5, 1), nullable=False),
        sa.Column("height_cm", sa.Numeric(5, 1), nullable=False),
        sa.Column("year_created", sa.Integer(), nullable=True),
        sa.Column("price_inr", sa.Integer(), nullable=False),
        sa.Column(
            "status",
            postgresql.ENUM(
                "available", "reserved", "sold",
                name="original_painting_status", create_type=False,
            ),
            nullable=False,
            server_default="available",
        ),
        sa.Column("story", sa.Text(), nullable=False, server_default=""),
        sa.Column(
            "image_id",
            sa.Integer(),
            sa.ForeignKey("media_assets.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "original_inquiries",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "original_painting_id",
            sa.Integer(),
            sa.ForeignKey("original_paintings.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("phone", sa.String(length=20), nullable=False, server_default=""),
        sa.Column("message", sa.Text(), nullable=False, server_default=""),
        sa.Column(
            "status",
            postgresql.ENUM(
                "new", "contacted", "negotiating", "won", "lost",
                name="original_inquiry_status", create_type=False,
            ),
            nullable=False,
            server_default="new",
        ),
        sa.Column("admin_note", sa.Text(), nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_original_inquiries_email", "original_inquiries", ["email"])
    op.create_index(
        "ix_original_inquiries_painting_id", "original_inquiries", ["original_painting_id"]
    )


def downgrade() -> None:
    op.drop_index("ix_original_inquiries_painting_id", table_name="original_inquiries")
    op.drop_index("ix_original_inquiries_email", table_name="original_inquiries")
    op.drop_table("original_inquiries")
    op.drop_table("original_paintings")
    postgresql.ENUM(name="original_inquiry_status").drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM(name="original_painting_status").drop(op.get_bind(), checkfirst=True)
