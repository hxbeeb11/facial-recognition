from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, Field


class PersonPublic(BaseModel):
    id: str
    full_name: str
    external_id: Optional[str] = None
    metadata: Optional[dict[str, Any]] = None
    created_at: Optional[str] = None


class FacialArea(BaseModel):
    """Pixel bounding box in the source image (from face detection)."""

    x: int
    y: int
    w: int
    h: int


class FaceMatchItem(BaseModel):
    face_index: int
    matched: bool
    cosine_distance: Optional[float] = None
    person: Optional[PersonPublic] = None
    matched_embedding_id: Optional[str] = Field(
        default=None,
        description="Gallery embedding that matched; use GET /api/v1/gallery/embeddings/{id}/image",
    )
    facial_area: Optional[FacialArea] = Field(
        default=None,
        description="Bounding box of this face in the uploaded image (for cropping in the UI).",
    )


class IdentifyImageResponse(BaseModel):
    matches: list[FaceMatchItem]


class VideoMatchItem(BaseModel):
    person: PersonPublic
    best_cosine_distance: float
    first_seen_frame_index: int
    first_seen_timestamp_sec: float = Field(
        description="Time in seconds to seek the uploaded video to this detection.",
    )
    matched_embedding_id: Optional[str] = None
    face_crop_jpeg_base64: Optional[str] = Field(
        default=None,
        description="JPEG crop of the face at the best-matching frame (base64, no data-URL prefix).",
    )


class IdentifyVideoResponse(BaseModel):
    matches: list[VideoMatchItem]
    video_fps: Optional[float] = Field(
        default=None,
        description="Reported frames per second of the uploaded file (for UI).",
    )


class EnrollResponse(BaseModel):
    person_id: str
    embedding_ids: list[str]
    source_image_uri: str
