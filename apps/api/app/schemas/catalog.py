from typing import Optional

from pydantic import BaseModel, Field


class CategoryOut(BaseModel):
    id: int
    name: str
    slug: str

    model_config = {"from_attributes": True}


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
    category: Optional[CategoryOut] = None

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
    category_id: Optional[int] = None
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
    category_id: Optional[int] = None
    slug: Optional[str] = None
