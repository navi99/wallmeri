from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class ArtistBrief(BaseModel):
    id: int
    slug: str
    name: str
    avatar_url: str

    model_config = {"from_attributes": True}


class ArtistOut(ArtistBrief):
    bio: str
    website_url: str
    instagram_url: str
    product_count: int = 0


class ArtistAdminOut(ArtistOut):
    identity_verified: bool
    agreement_received: bool
    contact_verified: bool
    is_active: bool
    created_at: datetime
    # Round-tripped so the admin edit form can tell "no managed avatar" apart
    # from "has one, just isn't being touched by this save" — see
    # admin._apply_artist_avatar, which needs the current value to avoid
    # detaching (and deleting) an unrelated field edit's untouched avatar.
    avatar_id: Optional[int] = None


class ArtistCreate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    slug: Optional[str] = None
    bio: str = ""
    avatar_url: str = ""
    # Set when the avatar came from the admin uploader (POST /admin/uploads);
    # left None for a pasted external URL. See admin._apply_artist_avatar.
    avatar_id: Optional[int] = None
    website_url: str = ""
    instagram_url: str = ""


class ArtistUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=200)
    slug: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    avatar_id: Optional[int] = None
    website_url: Optional[str] = None
    instagram_url: Optional[str] = None
    identity_verified: Optional[bool] = None
    agreement_received: Optional[bool] = None
    contact_verified: Optional[bool] = None
    is_active: Optional[bool] = None


class ApplicationCreate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    email: EmailStr
    phone: str = Field(default="", max_length=20)
    portfolio_url: str = Field(default="", max_length=500)
    pitch: str = Field(default="", max_length=4000)
    # Honeypot — bots fill it, humans never see it. Non-empty submissions are dropped.
    website: str = ""


class ApplicationOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str
    portfolio_url: str
    pitch: str
    status: str
    admin_note: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ApplicationUpdate(BaseModel):
    status: Optional[str] = Field(default=None, pattern="^(new|contacted|onboarded|rejected)$")
    admin_note: Optional[str] = None
