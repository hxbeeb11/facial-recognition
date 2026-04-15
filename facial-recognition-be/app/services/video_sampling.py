from __future__ import annotations

from pathlib import Path
from typing import Iterator

import cv2
import numpy as np

from app.config import settings


def iter_video_frames(
    path: str | Path,
    *,
    stride: int | None = None,
    max_frames: int | None = None,
) -> Iterator[tuple[int, np.ndarray]]:
    """
    Yields (frame_index, bgr_frame) for sampled frames (every `stride` frames).
    """
    stride = stride if stride is not None else settings.video_frame_stride
    max_frames = max_frames if max_frames is not None else settings.video_max_frames

    cap = cv2.VideoCapture(str(path))
    if not cap.isOpened():
        raise ValueError(f"Could not open video: {path}")

    try:
        idx = 0
        emitted = 0
        while True:
            ok, frame = cap.read()
            if not ok:
                break
            if idx % stride == 0:
                yield idx, frame
                emitted += 1
                if emitted >= max_frames:
                    break
            idx += 1
    finally:
        cap.release()
