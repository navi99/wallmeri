import enum
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum as SAEnum, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class ContactEnquiryStatus(str, enum.Enum):
    new = "new"
    open = "open"
    resolved = "resolved"
    spam = "spam"


class ContactEnquiry(Base):
    """A message sent from the public /contact form - a lead for the team to
    answer by hand, in the same family as ArtistApplication and
    OriginalInquiry.

    The row is the durable record: email delivery is deliberately swallowed
    on failure (see services/email_service), so the enquiry must survive even
    when no mail ever goes out.
    """

    __tablename__ = "contact_enquiries"

    id: Mapped[int] = mapped_column(primary_key=True)
    # Plain string rather than an enum column so a new topic can be added to
    # the form (and the schema's pattern) without a migration.
    category: Mapped[str] = mapped_column(String(40), nullable=False, default="general")
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=False, default="")
    subject: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    message: Mapped[str] = mapped_column(Text, nullable=False, default="")
    status: Mapped[ContactEnquiryStatus] = mapped_column(
        SAEnum(ContactEnquiryStatus, name="contact_enquiry_status"),
        default=ContactEnquiryStatus.new,
        nullable=False,
    )
    admin_note: Mapped[str] = mapped_column(Text, nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
