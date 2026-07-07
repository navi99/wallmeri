import enum
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Enum as SAEnum, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Artist(Base):
    __tablename__ = "artists"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(160), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    bio: Mapped[str] = mapped_column(Text, nullable=False, default="")
    avatar_url: Mapped[str] = mapped_column(String(500), nullable=False, default="")
    website_url: Mapped[str] = mapped_column(String(500), nullable=False, default="")
    instagram_url: Mapped[str] = mapped_column(String(500), nullable=False, default="")

    # Verification checklist — all must be true before the artist can go active.
    identity_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    agreement_received: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    contact_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False
    )

    products: Mapped[list["Product"]] = relationship(back_populates="artist")  # noqa: F821

    @property
    def checklist_complete(self) -> bool:
        return self.identity_verified and self.agreement_received and self.contact_verified


class ApplicationStatus(str, enum.Enum):
    new = "new"
    contacted = "contacted"
    onboarded = "onboarded"
    rejected = "rejected"


class ArtistApplication(Base):
    __tablename__ = "artist_applications"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=False, default="")
    portfolio_url: Mapped[str] = mapped_column(String(500), nullable=False, default="")
    pitch: Mapped[str] = mapped_column(Text, nullable=False, default="")
    status: Mapped[ApplicationStatus] = mapped_column(
        SAEnum(ApplicationStatus, name="artist_application_status"),
        default=ApplicationStatus.new,
        nullable=False,
    )
    admin_note: Mapped[str] = mapped_column(Text, nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
