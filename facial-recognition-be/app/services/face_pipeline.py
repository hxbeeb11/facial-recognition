from __future__ import annotations

from pathlib import Path
from typing import Any, Union

import numpy as np

from app.config import settings


def _check_dim(embedding: list[float]) -> list[float]:
    n = len(embedding)
    if n != settings.embedding_dimension:
        raise ValueError(
            f"Embedding has length {n}, expected {settings.embedding_dimension}. "
            "Use a model that matches embedding_dimension in config (ArcFace uses 512)."
        )
    return embedding


def represent_faces(
    img: Union[str, Path, np.ndarray],
    *,
    enforce_detection: bool = True,
    detector_backend: str | None = None,
) -> list[dict[str, Any]]:
    """
    Run DeepFace.represent on an image path or BGR numpy frame.
    Returns DeepFace's list of dicts (each includes 'embedding' and facial_area).
    """
    from deepface import DeepFace

    backend = detector_backend if detector_backend is not None else settings.detector_backend
    reps = DeepFace.represent(
        img_path=img,
        model_name=settings.face_model,
        detector_backend=backend,
        enforce_detection=enforce_detection,
    )
    if not isinstance(reps, list):
        reps = [reps]
    for r in reps:
        r["embedding"] = _check_dim([float(x) for x in r["embedding"]])
    return reps
