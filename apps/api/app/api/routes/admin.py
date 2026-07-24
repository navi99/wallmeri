import io
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.deps import get_current_admin
from app.core.utils import slugify
from app.models import (
    ORDER_TRANSITIONS,
    SITE_IMAGE_SLOTS,
    ApplicationStatus,
    Artist,
    ArtistApplication,
    Category,
    CustomUpload,
    CustomUploadStatus,
    InquiryStatus,
    MediaAsset,
    MediaKind,
    Order,
    OrderItem,
    OrderStatus,
    OriginalInquiry,
    OriginalPainting,
    OriginalPaintingStatus,
    PosterSize,
    Product,
    ProductImage,
    Review,
    ReviewStatus,
    SiteImage,
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
    SiteImageIn,
    SiteImageOut,
    SiteImageSlotUpdate,
    UploadOut,
)
from app.schemas.custom import (
    CropRect,
    CustomReviewAction,
    CustomReviewLineOut,
    CustomReviewOrderOut,
    PosterSizeCreate,
    PosterSizeOut,
    PosterSizeUpdate,
)
from app.schemas.order import OrderItemOut, OrderOut, OrderStatusUpdate
from app.schemas.original import (
    InquiryOut,
    InquiryUpdate,
    OriginalPaintingOut,
    OriginalPaintingUpsert,
)
from app.schemas.review import ReviewAdminOut, ReviewModerate
from app.services import (
    custom_upload_service,
    email_service,
    media_service,
    razorpay_service,
    storage_service,
)

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


MAX_PRODUCT_IMAGES = 6


def _apply_product_images(
    db: Session, product: Product, image_ids: list[int] | None, image_url: str | None
) -> None:
    """Sync product.images (the ordered gallery; index 0 = main image) with a
    submitted ordered list of managed-asset ids, deleting any attached
    MediaAsset this call drops from the gallery. Falls back to a pasted
    image_url when image_ids is empty. Only call when the caller's payload
    actually included an `image_ids` key — see admin_update_product.
    """
    image_ids = image_ids or []
    if len(image_ids) > MAX_PRODUCT_IMAGES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A poster can have at most {MAX_PRODUCT_IMAGES} images",
        )
    if len(set(image_ids)) != len(image_ids):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Duplicate image_id")

    existing_by_asset = {pi.image_id: pi for pi in product.images}
    kept_ids = set(image_ids)

    # Drop images no longer in the gallery, freeing their storage + row.
    for asset_id, pi in existing_by_asset.items():
        if asset_id not in kept_ids:
            product.images.remove(pi)
            media_service.delete_asset(db, pi.image)

    # Rebuild the ordered gallery, reusing rows for kept assets.
    new_images: list[ProductImage] = []
    for position, asset_id in enumerate(image_ids):
        pi = existing_by_asset.get(asset_id)
        if pi is None:
            asset = db.get(MediaAsset, asset_id)
            if asset is None or asset.kind != MediaKind.product:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown image_id")
            media_service.attach(asset)
            pi = ProductImage(image_id=asset.id, image=asset)
        pi.position = position
        new_images.append(pi)
    product.images = new_images

    if new_images:
        product.image_id = new_images[0].image_id
        product.image_url = storage_service.public_url(new_images[0].image.web_key)
    else:
        product.image_id = None
        if image_url is not None:
            product.image_url = image_url


@router.get("/products", response_model=list[ProductOut])
def admin_list_products(db: Session = Depends(get_db)):
    products = (
        db.query(Product)
        .options(
            joinedload(Product.categories),
            joinedload(Product.artist),
            joinedload(Product.image),
            joinedload(Product.images).joinedload(ProductImage.image),
        )
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
    _apply_product_images(db, product, payload.image_ids, payload.image_url)
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
    if "image_ids" in data:
        _apply_product_images(db, product, data.pop("image_ids"), data.pop("image_url", None))
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
    for pi in list(product.images):
        media_service.delete_asset(db, pi.image)
    db.delete(product)
    db.commit()
    return None


# ── Categories ───────────────────────────────────────────────────────────────

@router.get("/categories", response_model=list[CategoryOut])
def admin_list_categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.name).all()


def _apply_category_poster(
    db: Session, category: Category, poster_image_id: int | None, poster_image_url: str | None
) -> None:
    """Mirror of _apply_artist_avatar for Category.poster_image_id/poster_image_url."""
    old_asset_id = category.poster_image_id
    if poster_image_id is not None:
        if poster_image_id != old_asset_id:
            asset = db.get(MediaAsset, poster_image_id)
            if asset is None or asset.kind != MediaKind.category:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown poster_image_id"
                )
            media_service.attach(asset)
            category.poster_image_id = asset.id
            category.poster_image_url = storage_service.public_url(asset.web_key)
    else:
        category.poster_image_id = None
        if poster_image_url is not None:
            category.poster_image_url = poster_image_url

    if old_asset_id is not None and old_asset_id != category.poster_image_id:
        old_asset = db.get(MediaAsset, old_asset_id)
        if old_asset is not None:
            media_service.delete_asset(db, old_asset)


@router.post("/categories", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def admin_create_category(payload: CategoryCreate, db: Session = Depends(get_db)):
    category = Category(
        name=payload.name.strip(),
        slug=_unique_slug(db, Category, payload.slug or payload.name),
    )
    _apply_category_poster(db, category, payload.poster_image_id, payload.poster_image_url)
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
    if "poster_image_id" in data:
        _apply_category_poster(db, category, data.pop("poster_image_id"), data.pop("poster_image_url", None))
    for key, value in data.items():
        setattr(category, key, value)
    db.commit()
    db.refresh(category)
    return category


# ── Site images ──────────────────────────────────────────────────────────────

def _apply_site_images(db: Session, slot: str, items: list[SiteImageIn]) -> list[SiteImage]:
    """Replace-all for one slot's ordered gallery — same shape as
    _apply_product_images, scoped by slot instead of a product. Detaches and
    deletes any attached MediaAsset this call drops from the slot; validates
    against SITE_IMAGE_SLOTS (unknown slot, too many images) up front.
    """
    slot_def = SITE_IMAGE_SLOTS.get(slot)
    if slot_def is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unknown slot")
    max_images = slot_def["max_images"]
    slot_media = slot_def.get("media", "image")
    if len(items) > max_images:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"\"{slot_def['label']}\" allows at most {max_images} image(s)",
        )

    existing = db.query(SiteImage).filter(SiteImage.slot == slot).order_by(SiteImage.position).all()
    existing_by_asset = {si.image_id: si for si in existing if si.image_id is not None}
    kept_asset_ids = {item.image_id for item in items if item.image_id is not None}

    # Drop rows whose managed asset is no longer in the submitted list,
    # freeing storage + the row itself.
    for asset_id, si in existing_by_asset.items():
        if asset_id not in kept_asset_ids:
            db.delete(si)
            media_service.delete_asset(db, si.image)

    # Rows with no managed asset (a pasted URL) have no stable id to match
    # against, so just clear all of these and rebuild fresh below.
    for si in existing:
        if si.image_id is None:
            db.delete(si)
    db.flush()

    new_rows: list[SiteImage] = []
    for position, item in enumerate(items):
        if item.image_id is not None:
            si = existing_by_asset.get(item.image_id)
            if si is None:
                asset = db.get(MediaAsset, item.image_id)
                if asset is None or asset.kind != MediaKind.site:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown image_id"
                    )
                asset_is_video = asset.content_type in storage_service.ALLOWED_VIDEO_CONTENT_TYPES
                if (slot_media == "video") != asset_is_video:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"\"{slot_def['label']}\" requires a {slot_media} upload",
                    )
                media_service.attach(asset)
                si = SiteImage(slot=slot, image_id=asset.id, image=asset)
                db.add(si)
            si.image_url = storage_service.public_url(si.image.web_key)
        else:
            si = SiteImage(slot=slot, image_id=None, image_url=item.image_url)
            db.add(si)
        si.position = position
        si.alt_text = item.alt_text
        new_rows.append(si)

    db.commit()
    for si in new_rows:
        db.refresh(si)
    return new_rows


@router.get("/site-images", response_model=list[SiteImageOut])
def admin_list_site_images(db: Session = Depends(get_db)):
    return db.query(SiteImage).order_by(SiteImage.slot, SiteImage.position).all()


@router.put("/site-images/{slot}", response_model=list[SiteImageOut])
def admin_update_site_images(slot: str, payload: SiteImageSlotUpdate, db: Session = Depends(get_db)):
    return _apply_site_images(db, slot, payload.images)


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


# ── Poster sizes (custom-upload size -> price table) ────────────────────────

@router.get("/poster-sizes", response_model=list[PosterSizeOut])
def admin_list_poster_sizes(db: Session = Depends(get_db)):
    sizes = db.query(PosterSize).order_by(PosterSize.position).all()
    return [PosterSizeOut.model_validate(s) for s in sizes]


@router.post("/poster-sizes", response_model=PosterSizeOut, status_code=status.HTTP_201_CREATED)
def admin_create_poster_size(payload: PosterSizeCreate, db: Session = Depends(get_db)):
    if db.query(PosterSize).filter(PosterSize.code == payload.code).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Code already in use")
    size = PosterSize(**payload.model_dump())
    db.add(size)
    db.commit()
    db.refresh(size)
    return PosterSizeOut.model_validate(size)


@router.patch("/poster-sizes/{size_id}", response_model=PosterSizeOut)
def admin_update_poster_size(size_id: int, payload: PosterSizeUpdate, db: Session = Depends(get_db)):
    size = db.get(PosterSize, size_id)
    if not size:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Size not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(size, field, value)
    db.commit()
    db.refresh(size)
    return PosterSizeOut.model_validate(size)


# ── Custom-upload moderation queue ───────────────────────────────────────────
# Paid orders containing a custom line land in OrderStatus.in_review (see
# order_service.mark_order_paid) and wait here for approval before entering
# normal fulfilment. Rejection refunds the whole order — see the locked
# product decision in the plan; there is no per-line partial refund.

@router.get("/custom-review", response_model=list[CustomReviewOrderOut])
def admin_list_custom_review(db: Session = Depends(get_db)):
    orders = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.custom_upload))
        .filter(Order.status == OrderStatus.in_review)
        .order_by(Order.created_at.asc())
        .all()
    )
    result: list[CustomReviewOrderOut] = []
    for order in orders:
        custom_lines: list[CustomReviewLineOut] = []
        other_lines: list[OrderItemOut] = []
        for item in order.items:
            cu = item.custom_upload
            if item.is_custom and cu is not None:
                custom_lines.append(
                    CustomReviewLineOut(
                        order_item_id=item.id,
                        custom_upload_id=cu.id,
                        title=item.title_snapshot,
                        preview_url=cu.preview_url,
                        size_code=cu.size_code,
                        orientation=cu.orientation.value,
                        dpi=cu.dpi,
                        dpi_band=custom_upload_service.dpi_band(cu.dpi),
                        crop=CropRect(
                            x=cu.crop_x, y=cu.crop_y, width=cu.crop_width, height=cu.crop_height
                        ),
                        qty=item.qty,
                        price_inr=item.price_inr,
                    )
                )
            else:
                other_lines.append(OrderItemOut.model_validate(item))
        result.append(
            CustomReviewOrderOut(
                id=order.id,
                email=order.email,
                status=order.status.value,
                total_inr=order.total_inr,
                created_at=order.created_at,
                shipping_address=order.shipping_address,
                custom_lines=custom_lines,
                other_lines=other_lines,
            )
        )
    return result


@router.post("/orders/{order_id}/custom-review", response_model=OrderOut)
def admin_custom_review_action(
    order_id: int, payload: CustomReviewAction, db: Session = Depends(get_db)
):
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if order.status != OrderStatus.in_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Order is not awaiting review"
        )
    if payload.action == "reject" and not payload.note:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="A reason is required to reject"
        )

    order.review_note = payload.note
    order.reviewed_at = datetime.now(timezone.utc)

    if payload.action == "approve":
        order.status = OrderStatus.paid
        db.commit()
        db.refresh(order)
        email_service.send_custom_review_approved(order)
    else:
        order.status = OrderStatus.refunded
        if order.razorpay_payment_id:
            # Best effort — in mock mode (no keys) this is a no-op.
            razorpay_service.refund_payment(order.razorpay_payment_id, order.total_inr)
        db.commit()
        db.refresh(order)
        email_service.send_custom_review_rejected(order, payload.note)

    return OrderOut.model_validate(order)


@router.get("/custom-items/{custom_upload_id}/print-file")
def admin_custom_print_file(custom_upload_id: int, db: Session = Depends(get_db)):
    item = db.get(CustomUpload, custom_upload_id)
    if item is None or item.status != CustomUploadStatus.ordered:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    original = storage_service.read_bytes(item.media.original_key)
    # Full resolution, no downscale — this is the production print file.
    cropped = storage_service.crop_to_jpeg(
        original, item.crop_x, item.crop_y, item.crop_width, item.crop_height
    )
    filename = f"wallmeri_custom_{custom_upload_id}_{item.size_code}.jpg"
    return StreamingResponse(
        io.BytesIO(cropped),
        media_type="image/jpeg",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


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
    if order.status == OrderStatus.in_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Use the custom-review action to resolve an order awaiting review",
        )

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


# ── Original paintings ("Buy Original") ─────────────────────────────────────

def _original_out(painting: OriginalPainting) -> OriginalPaintingOut:
    dto = OriginalPaintingOut.model_validate(painting)
    dto.image_url = painting.image_url or painting.product.image_url
    return dto


def _apply_original_image(db: Session, painting: OriginalPainting, image_id: int | None) -> None:
    """Mirror of _apply_artist_avatar for OriginalPainting.image_id — a single
    optional image, uploaded via the same POST /admin/uploads (kind=product)."""
    old_asset_id = painting.image_id
    if image_id is not None:
        if image_id != old_asset_id:
            asset = db.get(MediaAsset, image_id)
            if asset is None or asset.kind != MediaKind.product:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown image_id")
            media_service.attach(asset)
            painting.image_id = asset.id
    else:
        painting.image_id = None

    if old_asset_id is not None and old_asset_id != painting.image_id:
        old_asset = db.get(MediaAsset, old_asset_id)
        if old_asset is not None:
            media_service.delete_asset(db, old_asset)


@router.get("/products/{product_id}/original", response_model=OriginalPaintingOut)
def admin_get_original(product_id: int, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product or not product.original_painting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No original for this product")
    return _original_out(product.original_painting)


@router.put("/products/{product_id}/original", response_model=OriginalPaintingOut)
def admin_upsert_original(
    product_id: int, payload: OriginalPaintingUpsert, db: Session = Depends(get_db)
):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    data = payload.model_dump(exclude_unset=True)
    image_id = data.pop("image_id", None)
    has_image_key = "image_id" in payload.model_fields_set

    painting = product.original_painting
    if painting is None:
        painting = OriginalPainting(product_id=product.id)
        db.add(painting)

    for key, value in data.items():
        if key == "status":
            value = OriginalPaintingStatus(value)
        setattr(painting, key, value)

    if has_image_key:
        _apply_original_image(db, painting, image_id)

    db.commit()
    db.refresh(painting)
    return _original_out(painting)


@router.delete("/products/{product_id}/original", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_original(product_id: int, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product or not product.original_painting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No original for this product")
    painting = product.original_painting
    if painting.image is not None:
        media_service.delete_asset(db, painting.image)
    db.delete(painting)
    db.commit()
    return None


# ── Original-painting inquiries ─────────────────────────────────────────────

@router.get("/original-inquiries", response_model=list[InquiryOut])
def admin_list_original_inquiries(db: Session = Depends(get_db)):
    inquiries = (
        db.query(OriginalInquiry)
        .options(joinedload(OriginalInquiry.painting).joinedload(OriginalPainting.product))
        .order_by(OriginalInquiry.created_at.desc())
        .all()
    )
    out = []
    for inq in inquiries:
        dto = InquiryOut.model_validate(inq)
        product = inq.painting.product if inq.painting else None
        dto.product_title = product.title if product else ""
        dto.product_slug = product.slug if product else ""
        out.append(dto)
    return out


@router.patch("/original-inquiries/{inquiry_id}", response_model=InquiryOut)
def admin_update_original_inquiry(
    inquiry_id: int, payload: InquiryUpdate, db: Session = Depends(get_db)
):
    inquiry = db.get(OriginalInquiry, inquiry_id)
    if not inquiry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry not found")
    data = payload.model_dump(exclude_unset=True)
    if "status" in data and data["status"]:
        inquiry.status = InquiryStatus(data["status"])
    if "admin_note" in data and data["admin_note"] is not None:
        inquiry.admin_note = data["admin_note"]
    db.commit()
    db.refresh(inquiry)
    product = inquiry.painting.product if inquiry.painting else None
    dto = InquiryOut.model_validate(inquiry)
    dto.product_title = product.title if product else ""
    dto.product_slug = product.slug if product else ""
    return dto
