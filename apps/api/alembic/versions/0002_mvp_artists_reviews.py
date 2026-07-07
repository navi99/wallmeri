"""MVP: artists, applications, product-category M2M, reviews, order fulfilment, google auth

Revision ID: 0002_mvp_artists_reviews
Revises: 0001_initial
Create Date: 2026-07-07

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0002_mvp_artists_reviews"
down_revision: Union[str, None] = "0001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── Users: Google sign-in support ────────────────────────────────────────
    op.alter_column("users", "password_hash", existing_type=sa.String(255), nullable=True)
    op.add_column("users", sa.Column("google_sub", sa.String(64), nullable=True))
    op.create_index("ix_users_google_sub", "users", ["google_sub"], unique=True)

    # ── Artists ──────────────────────────────────────────────────────────────
    op.create_table(
        "artists",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("slug", sa.String(length=160), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("bio", sa.Text(), nullable=False, server_default=""),
        sa.Column("avatar_url", sa.String(length=500), nullable=False, server_default=""),
        sa.Column("website_url", sa.String(length=500), nullable=False, server_default=""),
        sa.Column("instagram_url", sa.String(length=500), nullable=False, server_default=""),
        sa.Column("identity_verified", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("agreement_received", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("contact_verified", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_artists_slug", "artists", ["slug"], unique=True)

    application_status = postgresql.ENUM(
        "new", "contacted", "onboarded", "rejected", name="artist_application_status"
    )
    application_status.create(op.get_bind(), checkfirst=True)
    op.create_table(
        "artist_applications",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("phone", sa.String(length=20), nullable=False, server_default=""),
        sa.Column("portfolio_url", sa.String(length=500), nullable=False, server_default=""),
        sa.Column("pitch", sa.Text(), nullable=False, server_default=""),
        sa.Column(
            "status",
            postgresql.ENUM(
                "new", "contacted", "onboarded", "rejected",
                name="artist_application_status", create_type=False,
            ),
            nullable=False,
            server_default="new",
        ),
        sa.Column("admin_note", sa.Text(), nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_artist_applications_email", "artist_applications", ["email"])

    # ── Products: artist link + category M2M ────────────────────────────────
    op.add_column("products", sa.Column("artist_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_products_artist_id", "products", "artists", ["artist_id"], ["id"], ondelete="SET NULL"
    )
    op.create_index("ix_products_artist_id", "products", ["artist_id"])

    op.create_table(
        "product_categories",
        sa.Column("product_id", sa.Integer(), primary_key=True),
        sa.Column("category_id", sa.Integer(), primary_key=True),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"], ondelete="CASCADE"),
    )
    # Preserve existing single-category assignments as tags.
    op.execute(
        "INSERT INTO product_categories (product_id, category_id) "
        "SELECT id, category_id FROM products WHERE category_id IS NOT NULL"
    )
    op.drop_index("ix_products_category_id", table_name="products")
    op.drop_column("products", "category_id")

    op.add_column(
        "categories", sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true())
    )

    # ── Reviews ──────────────────────────────────────────────────────────────
    review_status = postgresql.ENUM("pending", "approved", "rejected", name="review_status")
    review_status.create(op.get_bind(), checkfirst=True)
    op.create_table(
        "reviews",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False, server_default=""),
        sa.Column("body", sa.Text(), nullable=False, server_default=""),
        sa.Column(
            "status",
            postgresql.ENUM(
                "pending", "approved", "rejected", name="review_status", create_type=False
            ),
            nullable=False,
            server_default="pending",
        ),
        sa.Column("reject_reason", sa.String(length=500), nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("product_id", "user_id", name="uq_review_product_user"),
    )
    op.create_index("ix_reviews_product_id", "reviews", ["product_id"])
    op.create_index("ix_reviews_user_id", "reviews", ["user_id"])

    # ── Orders: fulfilment states + tracking ────────────────────────────────
    # PG 12+ allows ADD VALUE in a transaction as long as the value isn't used
    # in the same transaction — we only add them here.
    op.execute("ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'shipped'")
    op.execute("ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'delivered'")
    op.execute("ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'refunded'")

    op.add_column("orders", sa.Column("courier_name", sa.String(120), nullable=False, server_default=""))
    op.add_column("orders", sa.Column("tracking_number", sa.String(120), nullable=False, server_default=""))
    op.add_column("orders", sa.Column("paid_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("orders", sa.Column("shipped_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("orders", sa.Column("delivered_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("orders", "delivered_at")
    op.drop_column("orders", "shipped_at")
    op.drop_column("orders", "paid_at")
    op.drop_column("orders", "tracking_number")
    op.drop_column("orders", "courier_name")
    # Enum values cannot be removed from order_status without a table rewrite; left in place.

    op.drop_table("reviews")
    op.execute("DROP TYPE IF EXISTS review_status")

    op.add_column("products", sa.Column("category_id", sa.Integer(), nullable=True))
    op.execute(
        "UPDATE products SET category_id = pc.category_id "
        "FROM (SELECT DISTINCT ON (product_id) product_id, category_id "
        "      FROM product_categories ORDER BY product_id, category_id) pc "
        "WHERE products.id = pc.product_id"
    )
    op.create_foreign_key(
        "products_category_id_fkey", "products", "categories",
        ["category_id"], ["id"], ondelete="SET NULL",
    )
    op.create_index("ix_products_category_id", "products", ["category_id"])
    op.drop_table("product_categories")
    op.drop_column("categories", "is_active")

    op.drop_index("ix_products_artist_id", table_name="products")
    op.drop_constraint("fk_products_artist_id", "products", type_="foreignkey")
    op.drop_column("products", "artist_id")

    op.drop_table("artist_applications")
    op.execute("DROP TYPE IF EXISTS artist_application_status")
    op.drop_table("artists")

    op.drop_index("ix_users_google_sub", table_name="users")
    op.drop_column("users", "google_sub")
    op.alter_column("users", "password_hash", existing_type=sa.String(255), nullable=False)
