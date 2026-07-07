from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import (
    Order,
    OrderItem,
    OrderStatus,
    Product,
    Review,
    ReviewStatus,
    User,
)
from app.schemas.review import (
    MyReviewOut,
    ReviewCreate,
    ReviewEligibility,
    ReviewOut,
)

router = APIRouter(tags=["reviews"])


def _get_product(db: Session, slug: str) -> Product:
    product = db.query(Product).filter(Product.slug == slug, Product.is_active.is_(True)).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


def _has_delivered_purchase(db: Session, user: User, product_id: int) -> bool:
    return (
        db.query(OrderItem.id)
        .join(Order, OrderItem.order_id == Order.id)
        .filter(
            OrderItem.product_id == product_id,
            Order.status == OrderStatus.delivered,
            (Order.user_id == user.id) | (Order.email == user.email),
        )
        .first()
        is not None
    )


def _to_review_out(review: Review, cls=ReviewOut):
    dto = cls.model_validate(review)
    name = review.user.full_name.strip() if review.user else ""
    dto.author_name = name or "Wallmeri customer"
    return dto


@router.get("/products/{slug}/reviews", response_model=list[ReviewOut])
def list_reviews(slug: str, db: Session = Depends(get_db)):
    product = _get_product(db, slug)
    reviews = (
        db.query(Review)
        .options(joinedload(Review.user))
        .filter(Review.product_id == product.id, Review.status == ReviewStatus.approved)
        .order_by(Review.created_at.desc())
        .all()
    )
    return [_to_review_out(r) for r in reviews]


@router.get("/products/{slug}/reviews/eligibility", response_model=ReviewEligibility)
def review_eligibility(
    slug: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    product = _get_product(db, slug)
    mine = (
        db.query(Review)
        .options(joinedload(Review.user))
        .filter(Review.product_id == product.id, Review.user_id == user.id)
        .first()
    )
    if mine:
        return ReviewEligibility(
            can_review=False,
            reason="already_reviewed",
            my_review=_to_review_out(mine, MyReviewOut),
        )
    if not _has_delivered_purchase(db, user, product.id):
        return ReviewEligibility(can_review=False, reason="not_delivered")
    return ReviewEligibility(can_review=True)


@router.post(
    "/products/{slug}/reviews",
    response_model=MyReviewOut,
    status_code=status.HTTP_201_CREATED,
)
def create_review(
    slug: str,
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    product = _get_product(db, slug)
    if not _has_delivered_purchase(db, user, product.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers with a delivered order can review this poster",
        )
    existing = (
        db.query(Review)
        .filter(Review.product_id == product.id, Review.user_id == user.id)
        .first()
    )
    if existing:
        # Author edits their review — it goes back through moderation.
        existing.rating = payload.rating
        existing.title = payload.title.strip()
        existing.body = payload.body.strip()
        existing.status = ReviewStatus.pending
        existing.reject_reason = ""
        db.commit()
        db.refresh(existing)
        return _to_review_out(existing, MyReviewOut)

    review = Review(
        product_id=product.id,
        user_id=user.id,
        rating=payload.rating,
        title=payload.title.strip(),
        body=payload.body.strip(),
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return _to_review_out(review, MyReviewOut)
