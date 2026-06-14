from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.deps import get_current_admin
from app.core.utils import slugify
from app.models import Order, Product
from app.schemas.catalog import ProductCreate, ProductOut, ProductUpdate
from app.schemas.order import OrderOut

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(get_current_admin)])


def _unique_slug(db: Session, base: str, exclude_id: int | None = None) -> str:
    slug = slugify(base)
    candidate = slug
    n = 2
    while True:
        query = db.query(Product).filter(Product.slug == candidate)
        if exclude_id is not None:
            query = query.filter(Product.id != exclude_id)
        if not query.first():
            return candidate
        candidate = f"{slug}-{n}"
        n += 1


@router.get("/products", response_model=list[ProductOut])
def admin_list_products(db: Session = Depends(get_db)):
    products = (
        db.query(Product)
        .options(joinedload(Product.category))
        .order_by(Product.created_at.desc())
        .all()
    )
    return [ProductOut.model_validate(p) for p in products]


@router.post("/products", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def admin_create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    slug_base = payload.slug or payload.title
    product = Product(
        slug=_unique_slug(db, slug_base),
        title=payload.title,
        description=payload.description,
        price_inr=payload.price_inr,
        image_url=payload.image_url,
        material=payload.material,
        stock=payload.stock,
        is_active=payload.is_active,
        is_featured=payload.is_featured,
        category_id=payload.category_id,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return ProductOut.model_validate(product)


@router.patch("/products/{product_id}", response_model=ProductOut)
def admin_update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    data = payload.model_dump(exclude_unset=True)
    if "slug" in data and data["slug"]:
        data["slug"] = _unique_slug(db, data["slug"], exclude_id=product.id)
    for key, value in data.items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)
    return ProductOut.model_validate(product)


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    db.delete(product)
    db.commit()
    return None


@router.get("/orders", response_model=list[OrderOut])
def admin_list_orders(db: Session = Depends(get_db)):
    orders = (
        db.query(Order)
        .options(joinedload(Order.items))
        .order_by(Order.created_at.desc())
        .all()
    )
    return [OrderOut.model_validate(o) for o in orders]
