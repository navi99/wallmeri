from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.deps import get_current_user, get_optional_user
from app.models import Order, User
from app.schemas.order import OrderOut

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("", response_model=list[OrderOut])
def list_my_orders(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    orders = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.user_id == user.id)
        .order_by(Order.created_at.desc())
        .all()
    )
    return [OrderOut.model_validate(o) for o in orders]


@router.get("/{order_id}", response_model=OrderOut)
def get_order(
    order_id: int,
    email: str | None = Query(default=None, description="Required for guest order lookup"),
    db: Session = Depends(get_db),
    user: User | None = Depends(get_optional_user),
):
    order = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    # Access control: the owning user, OR a guest who supplies the matching email.
    if user and order.user_id == user.id:
        return OrderOut.model_validate(order)
    if email and order.email.lower() == email.lower():
        return OrderOut.model_validate(order)

    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this order")
