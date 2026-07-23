from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.artist import ArtistBrief
from app.schemas.original import OriginalPaintingBrief


class CategoryOut(BaseModel):
    id: int
    name: str
    slug: str
    is_active: bool = True
    poster_image_url: str = ""
    # Round-tripped so the admin edit form can tell "no managed poster" apart
    # from "has one, just isn't being touched by this save" — mirrors
    # ProductOut.image_id / ArtistAdminOut.avatar_id.
    poster_image_id: Optional[int] = None

    model_config = {"from_attributes": True}


class CategoryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    slug: Optional[str] = None
    poster_image_url: Optional[str] = None
    poster_image_id: Optional[int] = None


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=120)
    is_active: Optional[bool] = None
    poster_image_url: Optional[str] = None
    poster_image_id: Optional[int] = None


class ProductImageOut(BaseModel):
    id: int
    image_id: int
    image_url: str
    thumb_url: str
    position: int

    model_config = {"from_attributes": True}


class ProductOut(BaseModel):
    id: int
    slug: str
    title: str
    description: str
    price_inr: int
    image_url: str
    thumb_url: str
    # Round-tripped so the admin edit form can tell "no managed image" apart
    # from "has one, just isn't being touched by this save" — see
    # admin._apply_product_images, which needs the current value to avoid
    # detaching (and deleting) an unrelated field edit's untouched image.
    image_id: Optional[int] = None
    # Ordered gallery (up to 6). images[0] is always the main image and stays
    # in sync with image_url/image_id — see admin._sync_main_image.
    images: list[ProductImageOut] = []
    material: str
    is_active: bool
    is_featured: bool
    artist: Optional[ArtistBrief] = None
    categories: list[CategoryOut] = []
    rating_avg: Optional[float] = None
    rating_count: int = 0
    original: Optional[OriginalPaintingBrief] = None

    model_config = {"from_attributes": True}


class ProductListOut(BaseModel):
    items: list[ProductOut]
    total: int
    page: int
    page_size: int
    pages: int


class ProductCreate(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    description: str = ""
    price_inr: int = Field(gt=0)
    image_url: str = ""
    # Ordered managed-asset ids (from POST /admin/uploads) making up the
    # gallery; images[0] becomes the main image. Empty when relying on the
    # pasted image_url fallback instead. See admin._apply_product_images.
    image_ids: list[int] = []
    material: str = "Metal"
    is_active: bool = True
    is_featured: bool = False
    artist_id: Optional[int] = None
    category_ids: list[int] = []
    slug: Optional[str] = None


class ProductUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=2, max_length=200)
    description: Optional[str] = None
    price_inr: Optional[int] = Field(default=None, gt=0)
    image_url: Optional[str] = None
    image_ids: Optional[list[int]] = None
    material: Optional[str] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    artist_id: Optional[int] = None
    category_ids: Optional[list[int]] = None
    slug: Optional[str] = None


class UploadOut(BaseModel):
    id: int
    image_url: str
    thumb_url: str
    width: int
    height: int


class SiteImageOut(BaseModel):
    id: int
    slot: str
    position: int
    image_url: str
    image_id: Optional[int] = None
    alt_text: str = ""

    model_config = {"from_attributes": True}


class SiteImageIn(BaseModel):
    """One ordered gallery entry submitted to PUT /admin/site-images/{slot}.

    Exactly one of image_id/image_url should carry the actual image — an
    admin-uploaded asset sets image_id (image_url is ignored, recomputed
    server-side from the asset), a pasted external URL sets image_url with
    image_id left null. Mirrors ProductCreate.image_ids but per-entry since
    each row also carries its own alt text.
    """

    image_id: Optional[int] = None
    image_url: str = ""
    alt_text: str = ""


class SiteImageSlotUpdate(BaseModel):
    images: list[SiteImageIn] = []
