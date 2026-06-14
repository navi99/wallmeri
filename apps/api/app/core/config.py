from functools import lru_cache
from typing import List, Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # App
    APP_NAME: str = "Wallmeri API"
    ENV: str = "development"
    API_PREFIX: str = "/api"

    # Database — either set DATABASE_URL (Render managed Postgres) or the
    # individual POSTGRES_* vars (local Docker dev).
    DATABASE_URL: Optional[str] = None
    POSTGRES_HOST: str = "db"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "wallmeri"
    POSTGRES_PASSWORD: str = "wallmeri"
    POSTGRES_DB: str = "wallmeri"

    # Auth
    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 14

    # CORS — comma separated list of allowed origins
    CORS_ORIGINS: str = "http://localhost:3000"

    # Seeded admin account
    ADMIN_EMAIL: str = "admin@wallmeri.in"
    ADMIN_PASSWORD: str = "admin12345"
    ADMIN_NAME: str = "Wallmeri Admin"

    # Razorpay
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_WEBHOOK_SECRET: str = ""

    # Shipping (flat rate in INR rupees)
    SHIPPING_FLAT_INR: int = 99
    FREE_SHIPPING_THRESHOLD_INR: int = 2999

    @property
    def database_url(self) -> str:
        if self.DATABASE_URL:
            # Render (and some other hosts) provide a postgres:// URL; SQLAlchemy
            # requires the postgresql+psycopg2:// scheme.
            url = self.DATABASE_URL
            if url.startswith("postgres://"):
                url = "postgresql+psycopg2://" + url[len("postgres://"):]
            elif url.startswith("postgresql://"):
                url = "postgresql+psycopg2://" + url[len("postgresql://"):]
            return url
        return (
            f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
