from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.api.routes import admin, artists, auth, catalog, checkout, orders, reviews
from app.services import storage_service

app = FastAPI(title=settings.APP_NAME, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Local-disk image storage fallback (no S3 configured): serve uploads directly.
if not storage_service.is_s3_configured():
    uploads_dir = Path(settings.UPLOADS_DIR)
    uploads_dir.mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")


@app.get("/health", tags=["meta"])
def health():
    return {"status": "ok", "service": settings.APP_NAME}


api = settings.API_PREFIX
app.include_router(auth.router, prefix=api)
app.include_router(catalog.router, prefix=api)
app.include_router(artists.router, prefix=api)
app.include_router(reviews.router, prefix=api)
app.include_router(checkout.router, prefix=api)
app.include_router(orders.router, prefix=api)
app.include_router(admin.router, prefix=api)


@app.get(api + "/health", tags=["meta"])
def api_health():
    return {"status": "ok", "service": settings.APP_NAME}
