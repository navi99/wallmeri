from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import admin, auth, catalog, checkout, orders

app = FastAPI(title=settings.APP_NAME, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["meta"])
def health():
    return {"status": "ok", "service": settings.APP_NAME}


api = settings.API_PREFIX
app.include_router(auth.router, prefix=api)
app.include_router(catalog.router, prefix=api)
app.include_router(checkout.router, prefix=api)
app.include_router(orders.router, prefix=api)
app.include_router(admin.router, prefix=api)


@app.get(api + "/health", tags=["meta"])
def api_health():
    return {"status": "ok", "service": settings.APP_NAME}
