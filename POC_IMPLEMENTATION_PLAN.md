# POC Implementation Plan — Face Recognition System

This document defines a **minimal viable POC** with **extension-friendly boundaries** so later work (threshold tuning, richer enrollment, video robustness, security) adds features instead of forcing rewrites.

---

## 1. POC scope (fixed for v0)

**In scope**

- **Enroll**: Register a person with one or more face images; store identity fields + face embedding(s) in a database.
- **Identify — image**: Upload an image; detect face(s); for each face, find the best gallery match if above threshold; return person details (or no match).
- **Identify — video**: Upload a video; sample frames at a configurable stride; run the same identification logic per frame; aggregate results (e.g. first match, or list of unique matches — pick one simple rule for POC and document it).

**Explicitly out of scope for POC** (add later without blocking)

- Liveness / anti-spoofing  
- Fine-grained false accept/reject analytics dashboards  
- Multi-tenant auth and full compliance workflows  
- Sub-frame tracking across video (can layer on top of the same pipeline)

---

## 2. Design principles (avoid future bottlenecks)

| Principle | What it means in practice |
|-----------|---------------------------|
| **Configuration over constants** | Similarity threshold, detector/backend model names, video frame stride, max video duration/size — all read from **environment variables or a config file**, injected into services. |
| **Thin API, thick domain** | FastAPI routes validate input and call **service functions/classes**; they do not embed ML or SQL details. |
| **Stable data model** | Tables for `person` and `face_embedding` (or equivalent) from day one; embeddings stored as vectors in **pgvector** (or a column type you can migrate). Avoid “one big JSON blob” as the only store for identities. |
| **One embedding pipeline** | Enrollment and identification both call the same function: `image → detected faces → aligned crop → embedding vector`. Changing models later touches one module. |
| **Explicit match policy** | Centralize “given probe embedding + gallery, return match or null” in one function with **documented distance metric** (e.g. cosine / L2) and threshold check. |

---

## 3. Recommended POC stack

| Layer | Choice | Note |
|-------|--------|------|
| API | **FastAPI** | Version routes (`/api/v1/...`) from the start. |
| ML | **DeepFace** (or detector + embedder split later) | Abstract behind `FacePipeline` interface (see §5). |
| Video / image I/O | **OpenCV** | Frame sampling only; stride from config. |
| Database | **PostgreSQL + pgvector** | Same DB for relational data and vector search; avoids a second “special” store for embeddings. |
| ORM | **SQLAlchemy 2.x** + migrations (**Alembic**) | Schema changes become migrations, not manual fixes. |

**Why PostgreSQL + pgvector for the POC (not SQLite-only tricks)**  
SQLite is fine for toy demos but vector search and concurrent writes diverge from your target architecture. Using pgvector early keeps enrollment/query code and deployment patterns aligned with production.

---

## 4. Data model (POC — extension-ready)

Minimal tables (names illustrative):

- **`person`**  
  - `id` (UUID or bigserial)  
  - `full_name`, `external_id` (optional), `metadata` (JSON, optional), `created_at`  
  - Future: extra columns without breaking embeddings.

- **`face_embedding`**  
  - `id`  
  - `person_id` (FK → `person`)  
  - `embedding` (vector type — pgvector)  
  - `source` (enum or string: `enrollment`, `retrain`, …) — optional for POC  
  - `created_at`  

**Rules**

- One person may have **multiple** rows in `face_embedding` (multiple enrollment photos) without schema change later.  
- POC can still **use only the first or best embedding** in code; the schema supports averaging or fusion later.

---

## 5. Module layout (suggested)

```
app/
  main.py                 # FastAPI app, CORS, mounts
  config.py               # Pydantic Settings: env-based config
  api/
    routes/
      enroll.py
      identify_image.py
      identify_video.py
  services/
    face_pipeline.py      # detect + embed (single entry point)
    matching.py           # nearest neighbor + threshold → Person | None
    video_sampling.py     # OpenCV frame iterator + stride
  db/
    session.py
    models.py             # SQLAlchemy models
    repositories.py       # optional: PersonRepository, EmbeddingRepository
  schemas/                # Pydantic request/response DTOs
```

**Extension hook**: Replace `FacePipeline` implementation later (different library or ONNX) while keeping `matching.py` and DB contracts stable.

---

## 6. API surface (POC)

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/v1/enroll` | Multipart: image(s) + identity fields → create `person` + embedding(s). |
| `POST` | `/api/v1/identify/image` | Multipart: image → list of `{bbox, person_id?, confidence?, details?}`. |
| `POST` | `/api/v1/identify/video` | Multipart: video → simplified result (see §7). |
| `GET` | `/health` | Liveness for containers. |

Keep response shapes **versioned** and **stable**; add fields later without breaking clients.

---

## 7. Video behavior for POC (simple, replaceable)

- Config: `VIDEO_FRAME_STRIDE`, `VIDEO_MAX_FRAMES` (cap work).  
- Loop: decode frames → for each sampled frame, run **same** identify path as images.  
- Aggregation for POC: e.g. **first frame with a match above threshold wins**, or **collect unique `person_id`s** — choose one and document it.  
- Later: swap aggregation for tracking (DeepSORT, etc.) without changing enrollment or DB schema.

---

## 8. Configuration (must be external)

At minimum:

- `DATABASE_URL`  
- `FACE_MODEL` / detector backend (if applicable)  
- `SIMILARITY_THRESHOLD` (or separate enroll vs identify if needed later)  
- `VIDEO_FRAME_STRIDE`, `VIDEO_MAX_FRAMES`  
- `MAX_UPLOAD_MB`  

Document default threshold as **starting point**; tuning is expected post-POC.

---

## 9. Implementation order (suggested)

1. **Project skeleton** — FastAPI app, `config.py`, health route.  
2. **Database** — Docker Compose for PostgreSQL + pgvector (or documented install), SQLAlchemy models, Alembic initial migration.  
3. **Face pipeline** — Single function: image bytes → list of `(embedding, optional bbox)`.  
4. **Matching** — Insert/query embeddings; pgvector nearest-neighbor query + threshold in `matching.py`.  
5. **Enroll endpoint** — Persist person + embedding.  
6. **Identify image** — End-to-end path.  
7. **Identify video** — Frame sampling + reuse identify logic + simple aggregation.  
8. **Smoke tests** — At least manual checklist; optional pytest for matching math with fixed vectors.

---

## 10. What this POC deliberately leaves open

| Later enhancement | How this plan accommodates it |
|-------------------|-------------------------------|
| Threshold tuning / ROC | `matching.py` + config only. |
| Multi-image enrollment / quality checks | `face_embedding` already multi-row; add validation in enroll service. |
| Better video (tracking, stride policies) | `video_sampling.py` + aggregation layer only. |
| Auth / RBAC | Middleware + `person` tenancy column later. |
| FAISS / external vector index | Replace query inside `matching.py`; keep table as source of truth or sync job. |

---

## 11. Success criteria for the POC

- Enroll at least one person from a photo and persist in DB.  
- Same person **matches** in a new photo; a stranger **does not** match (with reasonable lighting).  
- Short video runs without crashing; at least one scenario returns a match when the person appears.  
- Changing threshold and frame stride requires **no code change**, only config.

---

*End of POC implementation plan.*
