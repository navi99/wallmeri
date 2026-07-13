"""Customer-facing "Create your own" custom poster upload.

Public / optional-auth (guests can use this like any other checkout path).
Three steps: list available sizes, upload the source photo, then create a
cropped custom item (DPI-checked, priced from the chosen PosterSize) that the
storefront cart adds as a `custom_upload_id` line — see app.services.pricing
and app.api.routes.checkout for how it joins the shared cart/checkout.
"""
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_optional_user
from app.models import MediaAsset, MediaKind, Orientation, PosterSize, User
from app.schemas.catalog import UploadOut
from app.schemas.custom import CustomItemCreate, CustomItemOut, PosterSizeOut
from app.services import custom_upload_service, media_service, storage_service
from app.services.custom_upload_service import CustomUploadError

router = APIRouter(prefix="/custom", tags=["custom"])


@router.get("/sizes", response_model=list[PosterSizeOut])
def list_sizes(db: Session = Depends(get_db)):
    sizes = (
        db.query(PosterSize)
        .filter(PosterSize.is_enabled.is_(True))
        .order_by(PosterSize.position)
        .all()
    )
    return [PosterSizeOut.model_validate(s) for s in sizes]


@router.post("/uploads", response_model=UploadOut)
async def upload_custom_image(file: UploadFile = File(...), db: Session = Depends(get_db)):
    data = await file.read()
    try:
        asset = media_service.create_asset(db, data, file.content_type or "", MediaKind.custom)
    except storage_service.UploadError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    return UploadOut(
        id=asset.id,
        image_url=storage_service.public_url(asset.web_key),
        thumb_url=storage_service.public_url(asset.thumb_key),
        width=asset.width,
        height=asset.height,
    )


@router.post("/items", response_model=CustomItemOut)
def create_custom_item(
    payload: CustomItemCreate,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_optional_user),
):
    asset = db.get(MediaAsset, payload.media_id)
    if asset is None or asset.kind != MediaKind.custom:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown media_id")

    size = db.query(PosterSize).filter(PosterSize.code == payload.size_code).first()
    if size is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown size_code")

    try:
        item = custom_upload_service.create_custom_item(
            db,
            asset,
            size,
            Orientation(payload.orientation),
            payload.crop.x,
            payload.crop.y,
            payload.crop.width,
            payload.crop.height,
            user.id if user else None,
        )
    except CustomUploadError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    return CustomItemOut(
        custom_upload_id=item.id,
        preview_url=item.preview_url,
        size_code=size.code,
        size_label=size.label,
        orientation=item.orientation.value,
        price_inr=item.price_inr,
        dpi=item.dpi,
        dpi_band=custom_upload_service.dpi_band(item.dpi),
    )
