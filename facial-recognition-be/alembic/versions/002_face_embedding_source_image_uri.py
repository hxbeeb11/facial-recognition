"""add source_image_uri to face_embedding

Revision ID: 002_source_image
Revises: 001_initial
Create Date: 2026-04-01

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "002_source_image"
down_revision: Union[str, None] = "001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "face_embedding",
        sa.Column("source_image_uri", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("face_embedding", "source_image_uri")
