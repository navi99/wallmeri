from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.deps import get_current_admin
from app.core.utils import slugify
from app.models import (
    ORDER_TRANSITIONS,
    ApplicationStatus,
    Artist,
    ArtistApplication,
    Category,
    MediaAsset,
    MediaKind,
    Order,
    OrderStatus,
    Product,
    Review,
    ReviewStatus,
)
from app.schemas.artist import (
    ApplicationOut,
    ApplicationUpdate,
    ArtistAdminOut,
    ArtistCreate,
    ArtistUpdate,
)
from app.schemas.catalog import (
    CategoryCreate,
    CategoryOut,
    CategoryUpdate,
    ProductCreate,
    ProductOut,
    ProductUpdate,
    UploadOut,
)
from app.schemas.order import OrderOut, OrderStatusUpdate
from app.schemas.review import ReviewAdminOut, ReviewModerate
from app.services import email_service, media_service, razorpay_service, storage_service

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(get_current_admin)])


def _unique_slug(db: Session, model, base: str, exclude_id: int | None = None) -> str:
    slug = slugify(base)
    candidate = slug
    n = 2
    while True:
        query = db.query(model).filter(model.slug == candidate)
        if exclude_id is not None:
            query = query.filter(model.id != exclude_id)
        if not query.first():
            return candidate
        candidate = f"{slug}-{n}"
        n += 1


# ── Image upload ─────────────────────────────────────────────────────────────

@router.post("/uploads", response_model=UploadOut)
async def upload_image(
    file: UploadFile = File(...),
    kind: str = Form("product"),
    db: Session = Depends(get_db),
):
    try:
        media_kind = MediaKind(kind)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid kind")

    data = await file.read()
    try:
        asset = media_service.create_asset(db, data, file.content_type or "", media_kind)
    except storage_service.UploadError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    return UploadOut(
        id=asset.id,
        image_url=storage_service.public_url(asset.web_key),
        thumb_url=storage_service.public_url(asset.thumb_key),
        width=asset.width,
        height=asset.height,
    )


# ── Products ─────────────────────────────────────────────────────────────────

def _resolve_categories(db: Session, category_ids: list[int]) -> list[Category]:
    if not category_ids:
        return []
    categories = db.query(Category).filter(Category.id.in_(category_ids)).all()
    if len(categories) != len(set(category_ids)):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown category id")
    return categories


def _validate_publishable(product: Product) -> None:
    if product.is_active and (not product.image_url or not product.categories):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An active poster needs an image and at least one category",
        )


def _check_artist(db: Session, artist_id: int | None) -> None:
    if artist_id is not None and db.get(Artist, artist_id) is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown artist id")


def _apply_product_image(
    db: Session, product: Product, image_id: int | None, image_url: str | None
) -> None:
    """Sync product.image_id/image_url with a submitted image_id (managed
    upload) or image_url (pasted external link), deleting any previously
    attached MediaAsset this call replaces. Only call when the caller's
    payload actually included an `image_id` key — see admin_update_product.
    """
    old_asset_id = product.image_id
    if image_id is not None:
        if image_id != old_asset_id:
            asset = db.get(MediaAsset, image_id)
            if asset is None or asset.kind != MediaKind.product:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown image_id")
            media_service.attach(asset)
            product.image_id = asset.id
            product.image_url = storage_service.public_url(asset.web_key)
    else:
        product.image_id = None
        if image_url is not None:
            product.image_url = image_url

    if old_asset_id is not None and old_asset_id != product.image_id:
        old_asset = db.get(MediaAsset, old_asset_id)
        if old_asset is not None:
            media_service.delete_asset(db, old_asset)


@router.get("/products", response_model=list[ProductOut])
def admin_list_products(db: Session = Depends(get_db)):
    products = (
        db.query(Product)
        .options(joinedload(Product.categories), joinedload(Product.artist), joinedload(Product.image))
        .order_by(Product.created_at.desc())
        .all()
    )
    return [ProductOut.model_validate(p) for p in products]


@router.post("/products", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def admin_create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    _check_artist(db, payload.artist_id)
    product = Product(
        slug=_unique_slug(db, Product, payload.slug or payload.title),
        title=payload.title,
        description=payload.description,
        price_inr=payload.price_inr,
        material=payload.material,
        is_active=payload.is_active,
        is_featured=payload.is_featured,
        artist_id=payload.artist_id,
        categories=_resolve_categories(db, payload.category_ids),
    )
    _apply_product_image(db, product, payload.image_id, payload.image_url)
    _validate_publishable(product)
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
    if "artist_id" in data:
        _check_artist(db, data["artist_id"])
    if "category_ids" in data:
        product.categories = _resolve_categories(db, data.pop("category_ids") or [])
    if "slug" in data and data["slug"]:
        data["slug"] = _unique_slug(db, Product, data["slug"], exclude_id=product.id)
    if "image_id" in data:
        _apply_product_image(db, product, data.pop("image_id"), data.pop("image_url", None))
    for key, value in data.items():
        setattr(product, key, value)

    _validate_publishable(product)
    db.commit()
    db.refresh(product)
    return ProductOut.model_validate(product)


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    if product.image_id:
        asset = db.get(MediaAsset, product.image_id)
        if asset is not None:
            media_service.delete_asset(db, asset)
    db.delete(product)
    db.commit()
    return None


# ── Categories ───────────────────────────────────────────────────────────────

@router.get("/categories", response_model=list[CategoryOut])
def admin_list_categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.name).all()


@router.post("/categories", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def admin_create_category(payload: CategoryCreate, db: Session = Depends(get_db)):
    category = Category(
        name=payload.name.strip(),
        slug=_unique_slug(db, Category, payload.slug or payload.name),
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.patch("/categories/{category_id}", response_model=CategoryOut)
def admin_update_category(category_id: int, payload: CategoryUpdate, db: Session = Depends(get_db)):
    category = db.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(category, key, value)
    db.commit()
    db.refresh(category)
    return category


# ── Artists ──────────────────────────────────────────────────────────────────

def _artist_out(artist: Artist) -> ArtistAdminOut:
    dto = ArtistAdminOut.model_validate(artist)
    dto.product_count = len(artist.products)
    return dto


def _apply_artist_avatar(
    db: Session, artist: Artist, avatar_id: int | None, avatar_url: str | None
) -> None:
    """Mirror of _apply_product_image for Artist.avatar_id/avatar_url."""
    old_asset_id = artist.avatar_id
    if avatar_id is not None:
        if avatar_id != old_asset_id:
            asset = db.get(MediaAsset, avatar_id)
            if asset is None or asset.kind != MediaKind.avatar:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown avatar_id")
            media_service.attach(asset)
            artist.avatar_id = asset.id
            artist.avatar_url = storage_service.public_url(asset.web_key)
    else:
        artist.avatar_id = None
        if avatar_url is not None:
            artist.avatar_url = avatar_url

    if old_asset_id is not None and old_asset_id != artist.avatar_id:
        old_asset = db.get(MediaAsset, old_asset_id)
        if old_asset is not None:
            media_service.delete_asset(db, old_asset)


@router.get("/artists", response_model=list[ArtistAdminOut])
def admin_list_artists(db: Session = Depends(get_db)):
    artists = (
        db.query(Artist).options(joinedload(Artist.products)).order_by(Artist.name).all()
    )
    return [_artist_out(a) for a in artists]


@router.post("/artists", response_model=ArtistAdminOut, status_code=status.HTTP_201_CREATED)
def admin_create_artist(payload: ArtistCreate, db: Session = Depends(get_db)):
    artist = Artist(
        slug=_unique_slug(db, Artist, payload.slug or payload.name),
        name=payload.name.strip(),
        bio=payload.bio,
        website_url=payload.website_url,
        instagram_url=payload.instagram_url,
    )
    _apply_artist_avatar(db, artist, payload.avatar_id, payload.avatar_url)
    db.add(artist)
    db.commit()
    db.refresh(artist)
    return _artist_out(artist)


@router.patch("/artists/{artist_id}", response_model=ArtistAdminOut)
def admin_update_artist(artist_id: int, payload: ArtistUpdate, db: Session = Depends(get_db)):
    artist = db.get(Artist, artist_id)
    if not artist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artist not found")

    data = payload.model_dump(exclude_unset=True)
    if "slug" in data and data["slug"]:
        data["slug"] = _unique_slug(db, Artist, data["slug"], exclude_id=artist.id)
    if "avatar_id" in data:
        _apply_artist_avatar(db, artist, data.pop("avatar_id"), data.pop("avatar_url", None))
    for key, value in data.items():
        setattr(artist, key, value)

    # Verification gate: an artist can only be (or stay) active with a complete checklist.
    if artist.is_active and not artist.checklist_complete:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Complete the verification checklist before activating this artist",
        )

    db.commit()
    db.refresh(artist)
    return _artist_out(artist)


# ── Artist applications ─────────────────────────────────────────────────────

@router.get("/artist-applications", response_model=list[ApplicationOut])
def admin_list_applications(db: Session = Depends(get_db)):
    return (
        db.query(ArtistApplication).order_by(ArtistApplication.created_at.desc()).all()
    )


@router.patch("/artist-applications/{application_id}", response_model=ApplicationOut)
def admin_update_application(
    application_id: int, payload: ApplicationUpdate, db: Session = Depends(get_db)
):
    application = db.get(ArtistApplication, application_id)
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    data = payload.model_dump(exclude_unset=True)
    if "status" in data and data["status"]:
        application.status = ApplicationStatus(data["status"])
    if "admin_note" in data and data["admin_note"] is not None:
        application.admin_note = data["admin_note"]
    db.commit()
    db.refresh(application)
    return application


# ── Reviews moderation ───────────────────────────────────────────────────────

@router.get("/reviews", response_model=list[ReviewAdminOut])
def admin_list_reviews(
    status_filter: str = "pending",
    db: Session = Depends(get_db),
):
    query = db.query(Review).options(joinedload(Review.user), joinedload(Review.product))
    if status_filter in ("pending", "approved", "rejected"):
        query = query.filter(Review.status == ReviewStatus(status_filter))
    reviews = query.order_by(Review.created_at.asc()).all()
    out = []
    for r in reviews:
        dto = ReviewAdminOut.model_validate(r)
        dto.product_title = r.product.title if r.product else ""
        dto.product_slug = r.product.slug if r.product else ""
        dto.author_name = (r.user.full_name if r.user else "") or "—"
        dto.author_email = r.user.email if r.user else ""
        out.append(dto)
    return out


@router.patch("/reviews/{review_id}", response_model=ReviewAdminOut)
def admin_moderate_review(review_id: int, payload: ReviewModerate, db: Session = Depends(get_db)):
    review = (
        db.query(Review)
        .options(joinedload(Review.user), joinedload(Review.product))
        .filter(Review.id == review_id)
        .first()
    )
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    review.status = ReviewStatus(payload.status)
    review.reject_reason = payload.reject_reason if payload.status == "rejected" else ""
    db.commit()
    db.refresh(review)
    dto = ReviewAdminOut.model_validate(review)
    dto.product_title = review.product.title if review.product else ""
    dto.product_slug = review.product.slug if review.product else ""
    dto.author_name = (review.user.full_name if review.user else "") or "—"
    dto.author_email = review.user.email if review.user else ""
    return dto


# ── Orders ───────────────────────────────────────────────────────────────────

@router.get("/orders", response_model=list[OrderOut])
def admin_list_orders(db: Session = Depends(get_db)):
    orders = (
        db.query(Order)
        .options(joinedload(Order.items))
        .order_by(Order.created_at.desc())
        .all()
    )
    return [OrderOut.model_validate(o) for o in orders]


@router.patch("/orders/{order_id}/status", response_model=OrderOut)
def admin_update_order_status(
    order_id: int, payload: OrderStatusUpdate, db: Session = Depends(get_db)
):
    order = (
        db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).first()
    )
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    target = OrderStatus(payload.status)
    if target not in ORDER_TRANSITIONS.get(order.status, set()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot move order from '{order.status.value}' to '{target.value}'",
        )

    now = datetime.now(timezone.utc)
    order.status = target
    if target == OrderStatus.paid:
        order.paid_at = order.paid_at or now
    elif target == OrderStatus.shipped:
        order.courier_name = payload.courier_name or order.courier_name
        order.tracking_number = payload.tracking_number or order.tracking_number
        order.shipped_at = now
    elif target == OrderStatus.delivered:
        order.delivered_at = now
    elif target == OrderStatus.refunded and order.razorpay_payment_id:
        # Best effort — in mock mode (no keys) this is a no-op.
        razorpay_service.refund_payment(order.razorpay_payment_id, order.total_inr)

    db.commit()
    db.refresh(order)
    if target == OrderStatus.shipped:
        email_service.send_shipping_update(order)
    return OrderOut.model_validate(order)
