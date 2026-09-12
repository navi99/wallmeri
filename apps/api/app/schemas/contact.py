from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

# Kept in one place so the create pattern and the label map in the web form
# can be checked against each other by eye.
CATEGORY_PATTERN = "^(order|product|returns|wholesale|artist|general)$"


class ContactEnquiryCreate(BaseModel):
    category: str = Field(default="general", pattern=CATEGORY_PATTERN)
    name: str = Field(min_length=2, max_length=200)
    email: EmailStr
    phone: str = Field(default="", max_length=20)
    subject: str = Field(default="", max_length=200)
    # A floor of 10 chars: anything shorter is a bot or a mis-submit, never a
    # question anyone can actually answer.
    message: str = Field(min_length=10, max_length=4000)
    # Honeypot - bots fill it, humans never see it. Non-empty submissions are dropped.
    website: str = ""


class ContactEnquiryOut(BaseModel):
    id: int
    category: str
    name: str
    email: EmailStr
    phone: str
    subject: str
    message: str
    status: str
    admin_note: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ContactEnquiryUpdate(BaseModel):
    status: Optional[str] = Field(default=None, pattern="^(new|open|resolved|spam)$")
    admin_note: Optional[str] = None
