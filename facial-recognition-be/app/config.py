from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = "postgresql+psycopg2://faceapp:faceapp@localhost:5432/face_recognition"
    """SQLAlchemy URL (sync driver for Alembic and initial POC)."""

    embedding_dimension: int = 512
    """Must match pgvector column size and the face model output (ArcFace outputs 512-D)."""

    face_model: str = "ArcFace"
    """DeepFace recognition model. ArcFace (512-D) replaces Facenet512 for stronger identity separation.
    After changing this, re-enroll all persons — old embeddings are not comparable."""

    detector_backend: str = "retinaface"
    """DeepFace detector: opencv (fast, misses faces often), retinaface (better; may download weights once), mtcnn, mediapipe, ..."""

    max_cosine_distance: float = Field(default=0.6, ge=0.0, le=2.0)
    """Pgvector cosine distance (<=>); lower is more similar. Match if distance <= this value.
    Tune with false positive / false negative tradeoff for your gallery and probes."""

    upload_dir: Path = Path("data/uploads")
    max_upload_mb: int = 32

    video_frame_stride: int = 30
    """Process every Nth frame. Higher = faster, fewer chances to catch a face."""

    video_max_frames: int = 36
    """Hard cap on sampled frames per upload (each sample runs face detection + embedding)."""

    video_detector_backend: str = "retinaface"
    """Detector for video frames; same family as photo enroll when set to retinaface. Embeddings always use face_model (ArcFace).
    Video identify uses max_cosine_distance for matching (same threshold as /identify/photo). `opencv` is faster on CPU if needed."""

    video_frame_max_side: int = 640
    """Resize frames so max(width,height) <= this before detection (0 = no resize). Speeds up CPU a lot."""


settings = Settings()
