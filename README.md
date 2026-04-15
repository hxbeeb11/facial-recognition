# Facial recognition

Monorepo for a small **face enrollment and identification** stack: enroll people with a portrait and metadata, then match **photos** or **sampled video** against a **PostgreSQL + pgvector** gallery using **cosine distance** and a configurable threshold.

Designed for experimentation toward **CCTV-style** footage (low resolution, unconstrained pose), with room to tighten the pipeline and evaluation over time.

## Repository layout

| Path | Role |
|------|------|
| [`facial-recognition-be/`](facial-recognition-be/) | **FastAPI** backend — DeepFace (ArcFace embeddings, RetinaFace by default), Alembic migrations, Docker Compose for Postgres + pgvector |
| [`facial-recognition-fe/`](facial-recognition-fe/) | **Next.js** UI — enroll, photo identify, video identify |

## Prerequisites

- **Docker** (for Postgres + pgvector), or your own Postgres **with** the [`pgvector`](https://github.com/pgvector/pgvector) extension  
- **Python 3.11+** (backend)  
- **Node.js 20+** (frontend)

## Quick start

### 1. Database

From `facial-recognition-be/`:

```bash
docker compose up -d
```

If the DB container name is already taken, start the existing container or adjust `docker-compose.yml`.

### 2. Backend

```bash
cd facial-recognition-be
python -m venv .venv
# Windows: .venv\Scripts\activate
source .venv/bin/activate   # macOS / Linux
pip install -r requirements.txt
cp .env.example .env        # edit DATABASE_URL if needed
alembic upgrade head
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

API docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 3. Frontend

```bash
cd facial-recognition-fe
npm install
cp .env.example .env.local  # set NEXT_PUBLIC_API_BASE_URL to match the API (e.g. http://127.0.0.1:8000)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or match the host you use in the browser to avoid CORS mismatches with the API).

## Configuration highlights

| Area | Notes |
|------|--------|
| **Face model** | Default `ArcFace` (512-D). Changing model requires **re-enrolling** everyone — embeddings are not comparable across models. |
| **Matching** | Nearest neighbor in **pgvector** using **cosine distance**; match if distance ≤ `MAX_COSINE_DISTANCE`. |
| **Video** | Frames are sampled, then each sample is embedded and matched; defaults favor quality over speed (see `.env.example`). |

See `facial-recognition-be/.env.example` and `facial-recognition-fe/.env.example` for all variables.

## API overview

- `POST /api/v1/enroll` — multipart: portrait + person fields  
- `POST /api/v1/identify/image` — multipart image → per-face match results  
- `POST /api/v1/identify/video` — multipart video → matches over time  
- `GET /api/v1/gallery/...` — enrollment images for display in the UI  

## Tech stack

- **Backend:** FastAPI, SQLAlchemy, Alembic, DeepFace (TensorFlow), pgvector  
- **Frontend:** Next.js (App Router), Tailwind CSS v4, TypeScript  

## License

No license file is bundled in this repository; add one if you intend to distribute or open-source the project.
