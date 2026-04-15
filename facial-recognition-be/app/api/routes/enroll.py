from __future__ import annotations

import logging
import uuid
from pathlib import Path
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.config import settings
from app.db.models import FaceEmbedding, Person
from app.schemas.api import EnrollResponse
from app.services.face_pipeline import represent_faces

logger = logging.getLogger(__name__)
router = APIRouter()


def _suffix_from_upload(filename: str) -> str:
    p = Path(filename)
    if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp", ".bmp"}:
        return p.suffix.lower()
    return ".jpg"


def _profile_metadata_from_form(
    job_title: Optional[str],
    department: Optional[str],
    email: Optional[str],
    phone: Optional[str],
    location: Optional[str],
    notes: Optional[str],
) -> Optional[dict]:
    """Fixed enrollment profile schema stored in person.metadata (JSONB)."""
    pairs = {
        "job_title": (job_title or "").strip() or None,
        "department": (department or "").strip() or None,
        "email": (email or "").strip() or None,
        "phone": (phone or "").strip() or None,
        "location": (location or "").strip() or None,
        "notes": (notes or "").strip() or None,
    }
    out = {k: v for k, v in pairs.items() if v is not None}
    return out or None


@router.post("/enroll", response_model=EnrollResponse)
async def enroll(
    db: Annotated[Session, Depends(get_db)],
    full_name: str = Form(...),
    external_id: Optional[str] = Form(None),
    job_title: Optional[str] = Form(None),
    department: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    image: UploadFile = File(...),
) -> EnrollResponse:
    raw = await image.read()
    max_bytes = settings.max_upload_mb * 1024 * 1024
    if len(raw) > max_bytes:
        raise HTTPException(status_code=413, detail=f"File larger than {settings.max_upload_mb} MB")

    extra = _profile_metadata_from_form(
        job_title, department, email, phone, location, notes
    )

    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    stem = uuid.uuid4().hex
    suffix = _suffix_from_upload(image.filename or "image.jpg")
    dest = (settings.upload_dir / f"{stem}{suffix}").resolve()
    dest.write_bytes(raw)

    try:
        reps = represent_faces(dest, enforce_detection=True)
    except Exception as e:
        dest.unlink(missing_ok=True)
        msg = f"Face detection/embedding failed: {e}"
        logger.warning("enroll 400: %s", msg, exc_info=True)
        raise HTTPException(status_code=400, detail=msg) from e

    if not reps:
        dest.unlink(missing_ok=True)
        msg = "No face detected in image (try a clearer front-facing photo, or set DETECTOR_BACKEND=retinaface in .env)"
        logger.warning("enroll 400: %s", msg)
        raise HTTPException(status_code=400, detail=msg)

    # Single-person enrollment: use the first detected face (largest / primary ordering is model-dependent).
    emb = reps[0]["embedding"]

    person = Person(full_name=full_name, external_id=external_id, extra_metadata=extra)
    db.add(person)

    fe: FaceEmbedding
    try:
        db.flush()
        fe = FaceEmbedding(
            person_id=person.id,
            embedding=emb,
            source_image_uri=str(dest),
            source="enrollment",
        )
        db.add(fe)
        db.commit()
    except IntegrityError as e:
        db.rollback()
        dest.unlink(missing_ok=True)
        err = str(e.orig) if getattr(e, "orig", None) else str(e)
        if "external_id" in err or "ix_person_external_id" in err:
            ext = (external_id or "").strip()
            detail = (
                f'Reference ID "{ext}" is already enrolled. Use a different ID or delete that person first.'
                if ext
                else "This record conflicts with an existing person (reference ID must be unique when set)."
            )
        else:
            detail = "Enrollment could not be saved (database constraint)."
        raise HTTPException(status_code=409, detail=detail) from e

    db.refresh(person)
    db.refresh(fe)

    return EnrollResponse(
        person_id=str(person.id),
        embedding_ids=[str(fe.id)],
        source_image_uri=str(dest),
    )
