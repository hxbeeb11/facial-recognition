from __future__ import annotations

import mimetypes
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.config import settings
from app.db.models import FaceEmbedding

router = APIRouter()


@router.get("/gallery/embeddings/{embedding_id}/image")
def get_enrolled_source_image(
    embedding_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> FileResponse:
    """Serve the enrollment image file for a face_embedding row (path must stay under upload_dir)."""
    fe = db.get(FaceEmbedding, embedding_id)
    if fe is None or not fe.source_image_uri:
        raise HTTPException(status_code=404, detail="Embedding or image path not found")

    path = Path(fe.source_image_uri).resolve()
    base = Path(settings.upload_dir).resolve()
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Image file missing on disk")
    try:
        path.relative_to(base)
    except ValueError as e:
        raise HTTPException(status_code=403, detail="Image path not under upload directory") from e

    media_type, _ = mimetypes.guess_type(str(path))
    return FileResponse(
        path,
        media_type=media_type or "image/jpeg",
        filename=path.name,
    )
