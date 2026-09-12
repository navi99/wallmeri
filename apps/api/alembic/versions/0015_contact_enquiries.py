"""Contact enquiries: the public /contact form's lead capture

Adds contact_enquiries, holding messages sent from the storefront contact
page. The row is the durable record - email notification to
settings.ADMIN_NOTIFY_EMAIL is best-effort and swallowed on failure - so the
admin panel always has the enquiry even when SMTP is down or unconfigured.

Mirrors original_inquiries (0012) end to end, with category/subject added
for the tabbed contact form. category is a plain String, not an enum, so new
topics need no migration.

Revision ID: 0015_contact_enquiries
Revises: 0014_discount_settings
Create Date: 2026-09-12

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0015_contact_enquiries"
down_revision: Union[str, None] = "0014_discount_settings"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    enquiry_status = postgresql.ENUM(
        "new", "open", "resolved", "spam", name="contact_enquiry_status"
    )
    enquiry_status.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "contact_enquiries",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("category", sa.String(length=40), nullable=False, server_default="general"),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("phone", sa.String(length=20), nullable=False, server_default=""),
        sa.Column("subject", sa.String(length=200), nullable=False, server_default=""),
        sa.Column("message", sa.Text(), nullable=False, server_default=""),
        sa.Column(
            "status",
            postgresql.ENUM(
                "new", "open", "resolved", "spam",
                name="contact_enquiry_status", create_type=False,
            ),
            nullable=False,
            server_default="new",
        ),
        sa.Column("admin_note", sa.Text(), nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_contact_enquiries_email", "contact_enquiries", ["email"])


def downgrade() -> None:
    op.drop_index("ix_contact_enquiries_email", table_name="contact_enquiries")
    op.drop_table("contact_enquiries")
    postgresql.ENUM(name="contact_enquiry_status").drop(op.get_bind(), checkfirst=True)
