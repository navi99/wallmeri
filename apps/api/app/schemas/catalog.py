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
    material: str
    stock: int
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
    material: str = "Metal"
    stock: int = Field(default=100, ge=0)
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
    material: Optional[str] = None
    stock: Optional[int] = Field(default=None, ge=0)
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    artist_id: Optional[int] = None
    category_ids: Optional[list[int]] = None
    slug: Optional[str] = None


class UploadOut(BaseModel):
    image_url: str
    thumb_url: str
