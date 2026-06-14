import math
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models import Category, Product
from app.schemas.catalog import CategoryOut, ProductListOut, ProductOut

router = APIRouter(tags=["catalog"])


@router.get("/categories", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.name).all()


@router.get("/products", response_model=ProductListOut)
def list_products(
    db: Session = Depends(get_db),
    q: Optional[str] = Query(default=None, description="Search title/description"),
    category: Optional[str] = Query(default=None, description="Category slug"),
    sort: str = Query(default="newest", pattern="^(newest|price_asc|price_desc|title)$"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=12, ge=1, le=48),
):
    query = (
        db.query(Product)
        .options(joinedload(Product.category))
        .filter(Product.is_active.is_(True))
    )

    if q:
        like = f"%{q.strip()}%"
        query = query.filter(or_(Product.title.ilike(like), Product.description.ilike(like)))

    if category:
        query = query.join(Category).filter(Category.slug == category)

    total = query.with_entities(func.count(Product.id)).scalar() or 0

    if sort == "price_asc":
        query = query.order_by(Product.price_inr.asc())
    elif sort == "price_desc":
        query = query.order_by(Product.price_inr.desc())
    elif sort == "title":
        query = query.order_by(Product.title.asc())
    else:
        query = query.order_by(Product.created_at.desc(), Product.id.desc())

    items = query.offset((page - 1) * page_size).limit(page_size).all()
    pages = max(1, math.ceil(total / page_size))

    return ProductListOut(
        items=[ProductOut.model_validate(p) for p in items],
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


@router.get("/products/{slug}", response_model=ProductOut)
def get_product(slug: str, db: Session = Depends(get_db)):
    product = (
        db.query(Product)
        .options(joinedload(Product.category))
        .filter(Product.slug == slug, Product.is_active.is_(True))
        .first()
    )
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return ProductOut.model_validate(product)
