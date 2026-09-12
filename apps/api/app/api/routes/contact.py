from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.ratelimit import check_rate_limit
from app.models import ContactEnquiry
from app.schemas.contact import ContactEnquiryCreate
from app.services import email_service

router = APIRouter(tags=["contact"])


@router.post("/contact-enquiries", status_code=status.HTTP_201_CREATED)
def submit_enquiry(
    payload: ContactEnquiryCreate, request: Request, db: Session = Depends(get_db)
):
    check_rate_limit(request, scope="contact-enquiry", limit=5, window_seconds=3600)
    if payload.website:
        # Honeypot tripped - pretend success so bots learn nothing.
        return {"ok": True}

    enquiry = ContactEnquiry(
        category=payload.category,
        name=payload.name.strip(),
        email=payload.email.lower(),
        phone=payload.phone.strip(),
        subject=payload.subject.strip(),
        message=payload.message.strip(),
    )
    db.add(enquiry)
    db.commit()
    db.refresh(enquiry)

    # After the commit, and never before: email delivery is best-effort
    # (failures are swallowed inside email_service), so the row has to be
    # safely stored before we even try.
    email_service.send_contact_enquiry_notification(enquiry)
    email_service.send_contact_enquiry_ack(enquiry)
    return {"ok": True}
