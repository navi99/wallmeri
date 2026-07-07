from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    # Null for accounts created via Google sign-in that never set a password.
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    # Google's stable subject id, set once the account is linked to Google.
    google_sub: Mapped[str | None] = mapped_column(
        String(64), unique=True, index=True, nullable=True
    )
    full_name: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )

    orders: Mapped[list["Order"]] = relationship(back_populates="user")  # noqa: F821
