import math
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models import Artist, Category, Product, Review, ReviewStatus, product_categories
from app.schemas.catalog import CategoryOut, ProductListOut, ProductOut

router = APIRouter(tags=["catalog"])


def ratings_for(db: Session, product_ids: list[int]) -> dict[int, tuple[float, int]]:
    """Approved-review aggregates for a set of products: {id: (avg, count)}."""
    if not product_ids:
        return {}
    rows = (
        db.query(Review.product_id, func.avg(Review.rating), func.count(Review.id))
        .filter(Review.product_id.in_(product_ids), Review.status == ReviewStatus.approved)
        .group_by(Review.product_id)
        .all()
    )
    return {pid: (round(float(avg), 1), count) for pid, avg, count in rows}


def serialize_products(db: Session, products: list[Product]) -> list[ProductOut]:
    ratings = ratings_for(db, [p.id for p in products])
    out = []
    for p in products:
        dto = ProductOut.model_validate(p)
        if p.id in ratings:
            dto.rating_avg, dto.rating_count = ratings[p.id]
        out.append(dto)
    return out


@router.get("/categories", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return (
        db.query(Category)
        .filter(Category.is_active.is_(True))
        .order_by(Category.name)
        .all()
    )


@router.get("/products", response_model=ProductListOut)
def list_products(
    db: Session = Depends(get_db),
    q: Optional[str] = Query(default=None, description="Search title/description"),
    category: Optional[str] = Query(default=None, description="Category slug"),
    artist: Optional[str] = Query(default=None, description="Artist slug"),
    featured: Optional[bool] = Query(default=None),
    sort: str = Query(default="newest", pattern="^(newest|price_asc|price_desc|title)$"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=12, ge=1, le=48),
):
    query = (
        db.query(Product)
        .options(joinedload(Product.categories), joinedload(Product.artist), joinedload(Product.image))
        .filter(Product.is_active.is_(True))
    )

    if q:
        like = f"%{q.strip()}%"
        query = query.filter(or_(Product.title.ilike(like), Product.description.ilike(like)))

    if category:
        query = query.join(product_categories).join(Category).filter(Category.slug == category)

    if artist:
        query = query.join(Artist, Product.artist_id == Artist.id).filter(Artist.slug == artist)

    if featured is not None:
        query = query.filter(Product.is_featured.is_(featured))

    total = query.with_entities(func.count(func.distinct(Product.id))).scalar() or 0

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
        items=serialize_products(db, items),
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


@router.get("/products/{slug}", response_model=ProductOut)
def get_product(slug: str, db: Session = Depends(get_db)):
    product = (
        db.query(Product)
        .options(joinedload(Product.categories), joinedload(Product.artist), joinedload(Product.image))
        .filter(Product.slug == slug, Product.is_active.is_(True))
        .first()
    )
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return serialize_products(db, [product])[0]
