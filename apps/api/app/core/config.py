from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # App
    APP_NAME: str = "Wallmeri API"
    ENV: str = "development"
    API_PREFIX: str = "/api"

    # Database
    DATABASE_URL: str

    # Auth
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 14

    # CORS — comma separated list of allowed origins
    CORS_ORIGINS: str = "http://localhost:3000"

    # Seeded admin account
    ADMIN_EMAIL: str
    ADMIN_PASSWORD: str
    ADMIN_NAME: str

    # Razorpay (optional — leave blank to use mock mode)
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_WEBHOOK_SECRET: str = ""

    # Shipping (flat rate in INR rupees)
    SHIPPING_FLAT_INR: int = 99
    FREE_SHIPPING_THRESHOLD_INR: int = 2999

    # Object storage for uploaded images (S3-compatible, e.g. Cloudflare R2 / AWS S3).
    # Leave S3_BUCKET blank to fall back to local-disk storage served at /uploads
    # (fine for local dev; on Render attach a persistent disk or configure S3).
    S3_BUCKET: str = ""
    S3_ENDPOINT_URL: str = ""       # e.g. https://<account>.r2.cloudflarestorage.com
    S3_REGION: str = "auto"
    S3_ACCESS_KEY_ID: str = ""
    S3_SECRET_ACCESS_KEY: str = ""
    S3_PUBLIC_BASE_URL: str = ""    # public URL prefix for stored objects, no trailing slash
    UPLOADS_DIR: str = "uploads"    # local fallback directory
    # Public base URL of this API (used to build local /uploads URLs), e.g.
    # http://localhost:8000 locally or https://wallmeri-api.onrender.com in prod.
    PUBLIC_API_BASE_URL: str = "http://localhost:8000"

    # Upload limits and derivative sizes (apps/api/app/services/storage_service.py).
    MAX_UPLOAD_BYTES: int = 15 * 1024 * 1024  # 15 MB
    IMAGE_WEB_MAX_PX: int = 1600
    IMAGE_THUMB_MAX_PX: int = 480
    IMAGE_JPEG_QUALITY: int = 85

    # Custom poster upload (apps/api/app/services/custom_upload_service.py).
    # Effective DPI of the customer's crop at the chosen print size:
    # >= OK is a clean print, [MIN, OK) shows a "may look soft" warning but is
    # still allowed, < MIN is blocked outright.
    CUSTOM_DPI_OK: int = 150
    CUSTOM_DPI_MIN: int = 100
    CUSTOM_PREVIEW_MAX_PX: int = 1600

    # Google sign-in (optional — button hidden on the web when unset)
    GOOGLE_CLIENT_ID: str = ""

    # Email (optional — logs to console when SMTP_HOST is unset)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "Wallmeri <no-reply@wallmeri.in>"

    # Public base URL of the storefront (used in emails), e.g. http://localhost:3000
    PUBLIC_WEB_BASE_URL: str = "http://localhost:3000"

    @property
    def database_url(self) -> str:
        # Normalize postgres:// / postgresql:// to the scheme SQLAlchemy requires.
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            return "postgresql+psycopg2://" + url[len("postgres://"):]
        if url.startswith("postgresql://"):
            return "postgresql+psycopg2://" + url[len("postgresql://"):]
        return url

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
