from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.artist import ArtistBrief


class CategoryOut(BaseModel):
    id: int
    name: str
    slug: str
    is_active: bool = True

    model_config = {"from_attributes": True}


class CategoryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    slug: Optional[str] = None


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=120)
    is_active: Optional[bool] = None


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
    # admin._apply_product_image, which needs the current value to avoid
    # detaching (and deleting) an unrelated field edit's untouched image.
    image_id: Optional[int] = None
    material: str
    is_active: bool
    is_featured: bool
    artist: Optional[ArtistBrief] = None
    categories: list[CategoryOut] = []
    rating_avg: Optional[float] = None
    rating_count: int = 0

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
    # Set when the image came from the admin uploader (POST /admin/uploads);
    # left None for a pasted external URL. See admin._apply_product_image.
    image_id: Optional[int] = None
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
    image_id: Optional[int] = None
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
