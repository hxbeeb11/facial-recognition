from __future__ import annotations

import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import settings
from app.db.models import FaceEmbedding, Person


def find_best_match(
    session: Session,
    embedding: list[float],
) -> tuple[Person | None, float | None, uuid.UUID | None]:
    """
    Return the closest gallery person by cosine distance on face_embedding rows.
    If the best distance is above max_cosine_distance, returns (None, distance, None).
    On match, returns the winning FaceEmbedding id for serving the enrolled source image.
    """
    count = session.scalar(select(func.count()).select_from(FaceEmbedding))
    if count == 0:
        return None, None, None

    distance_expr = FaceEmbedding.embedding.cosine_distance(embedding)
    stmt = (
        select(FaceEmbedding, distance_expr.label("dist"))
        .order_by(distance_expr)
        .limit(1)
    )
    row = session.execute(stmt).first()
    if row is None:
        return None, None, None

    fe, dist = row
    dist_f = float(dist) if dist is not None else None
    if dist_f is None or dist_f > settings.max_cosine_distance:
        return None, dist_f, None

    person = session.get(Person, fe.person_id)
    return person, dist_f, fe.id


def person_to_public_dict(person: Person) -> dict:
    return {
        "id": str(person.id),
        "full_name": person.full_name,
        "external_id": person.external_id,
        "metadata": person.extra_metadata,
        "created_at": person.created_at.isoformat() if person.created_at else None,
    }
