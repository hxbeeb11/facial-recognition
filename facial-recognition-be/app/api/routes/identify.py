from __future__ import annotations

import base64
import logging
import os
import tempfile
from pathlib import Path
from typing import Annotated, Any, Optional

import cv2
import numpy as np
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.config import settings
from app.schemas.api import (
    FaceMatchItem,
    FacialArea,
    IdentifyImageResponse,
    IdentifyVideoResponse,
    PersonPublic,
    VideoMatchItem,
)
from app.services.face_pipeline import represent_faces
from app.db.models import Person
from app.services.matching import find_best_match, person_to_public_dict
from app.services.video_sampling import iter_video_frames

router = APIRouter()
_log = logging.getLogger(__name__)


def _downscale_bgr_frame(frame: np.ndarray, max_side: int) -> np.ndarray:
    if max_side <= 0:
        return frame
    h, w = frame.shape[:2]
    if max(h, w) <= max_side:
        return frame
    scale = max_side / max(h, w)
    nw = max(1, int(w * scale))
    nh = max(1, int(h * scale))
    return cv2.resize(frame, (nw, nh), interpolation=cv2.INTER_AREA)


def _facial_area_from_represent(rep: dict[str, Any]) -> Optional[FacialArea]:
    """Normalize DeepFace `facial_area` (dict or [x,y,w,h]) into a schema."""
    raw = rep.get("facial_area")
    if raw is None:
        return None
    try:
        if isinstance(raw, dict):
            x = raw.get("x")
            y = raw.get("y")
            w = raw.get("w")
            h = raw.get("h")
            if all(v is not None for v in (x, y, w, h)):
                return FacialArea(x=int(x), y=int(y), w=int(w), h=int(h))
        if isinstance(raw, (list, tuple)) and len(raw) >= 4:
            return FacialArea(
                x=int(raw[0]),
                y=int(raw[1]),
                w=int(raw[2]),
                h=int(raw[3]),
            )
    except (TypeError, ValueError):
        return None
    return None


def _crop_face_jpeg_bgr(frame: np.ndarray, fa: FacialArea) -> bytes:
    """Encode face region as JPEG bytes (BGR OpenCV frame)."""
    h_img, w_img = frame.shape[:2]
    x = max(0, min(int(fa.x), w_img - 1))
    y = max(0, min(int(fa.y), h_img - 1))
    w = max(1, min(int(fa.w), w_img - x))
    h = max(1, min(int(fa.h), h_img - y))
    crop = frame[y : y + h, x : x + w]
    ok, buf = cv2.imencode(".jpg", crop, [cv2.IMWRITE_JPEG_QUALITY, 88])
    if not ok:
        return b""
    return bytes(buf)


@router.post("/identify/image", response_model=IdentifyImageResponse)
async def identify_image(
    db: Annotated[Session, Depends(get_db)],
    image: UploadFile = File(...),
) -> IdentifyImageResponse:
    raw = await image.read()
    max_bytes = settings.max_upload_mb * 1024 * 1024
    if len(raw) > max_bytes:
        raise HTTPException(status_code=413, detail=f"File larger than {settings.max_upload_mb} MB")

    arr = np.frombuffer(raw, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=400, detail="Could not decode image")

    try:
        reps = represent_faces(img, enforce_detection=True)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Face detection/embedding failed: {e}") from e

    matches: list[FaceMatchItem] = []
    for i, r in enumerate(reps):
        emb = r["embedding"]
        fa = _facial_area_from_represent(r)
        person, dist, emb_id = find_best_match(db, emb)
        if person is None:
            matches.append(
                FaceMatchItem(
                    face_index=i,
                    matched=False,
                    cosine_distance=dist,
                    person=None,
                    matched_embedding_id=None,
                    facial_area=fa,
                )
            )
        else:
            matches.append(
                FaceMatchItem(
                    face_index=i,
                    matched=True,
                    cosine_distance=dist,
                    person=PersonPublic(**person_to_public_dict(person)),
                    matched_embedding_id=str(emb_id) if emb_id else None,
                    facial_area=fa,
                )
            )

    return IdentifyImageResponse(matches=matches)


@router.post("/identify/video", response_model=IdentifyVideoResponse)
async def identify_video(
    db: Annotated[Session, Depends(get_db)],
    video: UploadFile = File(...),
) -> IdentifyVideoResponse:
    raw = await video.read()
    max_bytes = settings.max_upload_mb * 1024 * 1024
    if len(raw) > max_bytes:
        raise HTTPException(status_code=413, detail=f"File larger than {settings.max_upload_mb} MB")

    suffix = Path(video.filename or "clip.mp4").suffix or ".mp4"
    tmp_path: Optional[str] = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(raw)
            tmp_path = tmp.name

        cap_probe = cv2.VideoCapture(tmp_path)
        fps_raw = cap_probe.get(cv2.CAP_PROP_FPS)
        cap_probe.release()
        fps = float(fps_raw) if fps_raw and fps_raw > 0 else 25.0

        _log.info(
            "identify/video: stride=%s max_frames=%s detector=%s max_side=%s",
            settings.video_frame_stride,
            settings.video_max_frames,
            settings.video_detector_backend,
            settings.video_frame_max_side,
        )

        best_by_person: dict[str, tuple[Person, float, int, str, str]] = {}

        for frame_idx, frame in iter_video_frames(tmp_path):
            frame_in = _downscale_bgr_frame(frame, settings.video_frame_max_side)
            try:
                reps = represent_faces(
                    frame_in,
                    enforce_detection=False,
                    detector_backend=settings.video_detector_backend,
                )
            except Exception:
                continue
            for r in reps:
                emb = r["embedding"]
                person, dist, emb_id = find_best_match(db, emb)
                if person is None or dist is None or emb_id is None:
                    continue
                pid = str(person.id)
                eid = str(emb_id)
                fa = _facial_area_from_represent(r)
                crop_b64 = ""
                if fa is not None:
                    try:
                        jpg = _crop_face_jpeg_bgr(frame_in, fa)
                        if jpg:
                            crop_b64 = base64.b64encode(jpg).decode("ascii")
                    except Exception:
                        pass
                if pid not in best_by_person or dist < best_by_person[pid][1]:
                    best_by_person[pid] = (person, dist, frame_idx, eid, crop_b64)

        out: list[VideoMatchItem] = []
        for _pid, (person, dist, fidx, eid, crop_b64) in best_by_person.items():
            ts = float(fidx) / fps if fps > 0 else 0.0
            out.append(
                VideoMatchItem(
                    person=PersonPublic(**person_to_public_dict(person)),
                    best_cosine_distance=dist,
                    first_seen_frame_index=fidx,
                    first_seen_timestamp_sec=round(ts, 4),
                    matched_embedding_id=eid,
                    face_crop_jpeg_base64=crop_b64 or None,
                )
            )
        out.sort(key=lambda x: x.first_seen_frame_index)
        return IdentifyVideoResponse(matches=out, video_fps=round(fps, 4) if fps_raw and fps_raw > 0 else None)
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)
