from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import io
import zipfile
import fnmatch
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Any
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class ShareCreate(BaseModel):
    site: Any


@api_router.get("/")
async def root():
    return {"message": "ok"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for c in checks:
        if isinstance(c['timestamp'], str):
            c['timestamp'] = datetime.fromisoformat(c['timestamp'])
    return checks


# -------- Share preview links --------
@api_router.post("/share")
async def create_share(payload: ShareCreate):
    sid = uuid.uuid4().hex[:12]
    doc = {"id": sid, "site": payload.site, "createdAt": datetime.now(timezone.utc).isoformat()}
    await db.shares.insert_one(doc)
    return {"id": sid}


@api_router.get("/share/{sid}")
async def get_share(sid: str):
    doc = await db.shares.find_one({"id": sid}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Share not found")
    return doc


# -------- Source zip download --------
EXCLUDES = {"node_modules", "__pycache__", ".git", "build", "dist", ".next", ".cache", ".venv", "venv", "yarn-error.log"}


def _walk_include(app_root: Path):
    for root, dirs, files in os.walk(app_root):
        # prune excludes in-place
        dirs[:] = [d for d in dirs if d not in EXCLUDES and not d.startswith(".")]
        for f in files:
            if f in EXCLUDES:
                continue
            full = Path(root) / f
            # Skip very large files (>5MB)
            try:
                if full.stat().st_size > 5_000_000:
                    continue
            except OSError:
                continue
            yield full


@api_router.get("/source-zip")
async def source_zip():
    app_root = Path("/app")
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        for path in _walk_include(app_root):
            arcname = path.relative_to(app_root.parent)
            z.write(path, arcname.as_posix())
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="application/zip",
        headers={"Content-Disposition": 'attachment; filename="website-builder-source.zip"'},
    )


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
