"""Fix A3 poster_sizes dimensions

0006 originally seeded A3 as (29.7 x 42 cm) - the ISO 216 A3 sheet size -
then a later commit corrected that INSERT to (30 x 40 cm), the size WallMeri
actually prints. Editing an already-applied migration's INSERT only affects
databases that run it fresh; it does nothing for the `poster_sizes` row every
existing deployment (including production) already inserted with the old
values. This migration corrects that row in place.

Revision ID: 0013_fix_a3_dimensions
Revises: 0012_original_paintings
Create Date: 2026-09-09

"""
from typing import Sequence, Union

from alembic import op

revision: str = "0013_fix_a3_dimensions"
down_revision: Union[str, None] = "0012_original_paintings"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        UPDATE poster_sizes
        SET label = 'A3 (30 x 40 cm)', width_cm = 30.0, height_cm = 40.0
        WHERE code = 'A3' AND width_cm = 29.7 AND height_cm = 42.0
        """
    )


def downgrade() -> None:
    op.execute(
        """
        UPDATE poster_sizes
        SET label = 'A3 (29.7 x 42 cm)', width_cm = 29.7, height_cm = 42.0
        WHERE code = 'A3' AND width_cm = 30.0 AND height_cm = 40.0
        """
    )
