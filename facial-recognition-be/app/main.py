import os

# Quieter TensorFlow / oneDNN on stderr before any TF import (DeepFace loads TF lazily).
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")
os.environ.setdefault("TF_ENABLE_ONEDNN_OPTS", "0")

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import enroll, gallery, identify
from app.config import settings


@asynccontextmanager
async def lifespan(_app: FastAPI):
    Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
    yield


app = FastAPI(title="Face Recognition POC", version="0.1.0", lifespan=lifespan)

# Explicit origins + regex so dev works on alternate ports / IPv6 localhost (::1) / 0.0.0.0.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(enroll.router, prefix="/api/v1", tags=["enroll"])
app.include_router(identify.router, prefix="/api/v1", tags=["identify"])
app.include_router(gallery.router, prefix="/api/v1", tags=["gallery"])


@app.get("/")
def root() -> dict[str, str]:
    return {
        "service": "Face Recognition POC",
        "docs": "/docs",
        "health": "/health",
        "api": "/api/v1",
    }


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
