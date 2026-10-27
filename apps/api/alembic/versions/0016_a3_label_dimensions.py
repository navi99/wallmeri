"""Relabel the A3 poster size by its real dimensions

The size we print is 30 x 40 cm, which is not the ISO 216 A3 sheet
(29.7 x 42 cm) - 0013 already corrected the stored dimensions, but the label
kept the "A3" name, so buyers were told A3 and handed a different ratio.
Buyer-facing copy now leads with the dimensions.

`code` stays 'A3': it is a stable string snapshot on custom_uploads.size_code
and on order lines, so renaming it would rewrite existing orders' history.
Only the display label changes. As with 0013, editing 0006's seed INSERT only
helps databases that run it fresh; this migration fixes the row every existing
deployment already inserted.

Revision ID: 0016_a3_label_dimensions
Revises: 0015_contact_enquiries
Create Date: 2026-10-27

"""
from typing import Sequence, Union

from alembic import op

revision: str = "0016_a3_label_dimensions"
down_revision: Union[str, None] = "0015_contact_enquiries"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        UPDATE poster_sizes
        SET label = '30 x 40 cm'
        WHERE code = 'A3' AND label = 'A3 (30 x 40 cm)'
        """
    )


def downgrade() -> None:
    op.execute(
        """
        UPDATE poster_sizes
        SET label = 'A3 (30 x 40 cm)'
        WHERE code = 'A3' AND label = '30 x 40 cm'
        """
    )
