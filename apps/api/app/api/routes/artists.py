from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.api.routes.catalog import serialize_products
from app.core.database import get_db
from app.core.ratelimit import check_rate_limit
from app.models import Artist, ArtistApplication, Product
from app.schemas.artist import ApplicationCreate, ArtistBrief, ArtistOut
from app.schemas.catalog import ProductOut

router = APIRouter(tags=["artists"])


def _product_counts(db: Session, artist_ids: list[int]) -> dict[int, int]:
    if not artist_ids:
        return {}
    rows = (
        db.query(Product.artist_id, func.count(Product.id))
        .filter(Product.artist_id.in_(artist_ids), Product.is_active.is_(True))
        .group_by(Product.artist_id)
        .all()
    )
    return dict(rows)


@router.get("/artists", response_model=list[ArtistOut])
def list_artists(db: Session = Depends(get_db)):
    artists = db.query(Artist).filter(Artist.is_active.is_(True)).order_by(Artist.name).all()
    counts = _product_counts(db, [a.id for a in artists])
    out = []
    for a in artists:
        dto = ArtistOut.model_validate(a)
        dto.product_count = counts.get(a.id, 0)
        out.append(dto)
    return out


@router.get("/artists/{slug}", response_model=ArtistOut)
def get_artist(slug: str, db: Session = Depends(get_db)):
    artist = db.query(Artist).filter(Artist.slug == slug, Artist.is_active.is_(True)).first()
    if not artist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artist not found")
    dto = ArtistOut.model_validate(artist)
    dto.product_count = _product_counts(db, [artist.id]).get(artist.id, 0)
    return dto


@router.get("/artists/{slug}/products", response_model=list[ProductOut])
def artist_products(slug: str, db: Session = Depends(get_db)):
    artist = db.query(Artist).filter(Artist.slug == slug, Artist.is_active.is_(True)).first()
    if not artist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artist not found")
    products = (
        db.query(Product)
        .options(joinedload(Product.categories), joinedload(Product.artist), joinedload(Product.image))
        .filter(Product.artist_id == artist.id, Product.is_active.is_(True))
        .order_by(Product.created_at.desc())
        .all()
    )
    return serialize_products(db, products)


@router.post("/artist-applications", status_code=status.HTTP_201_CREATED)
def submit_application(
    payload: ApplicationCreate, request: Request, db: Session = Depends(get_db)
):
    check_rate_limit(request, scope="artist-application", limit=5, window_seconds=3600)
    if payload.website:
        # Honeypot tripped — pretend success so bots learn nothing.
        return {"ok": True}
    application = ArtistApplication(
        name=payload.name.strip(),
        email=payload.email.lower(),
        phone=payload.phone.strip(),
        portfolio_url=payload.portfolio_url.strip(),
        pitch=payload.pitch.strip(),
    )
    db.add(application)
    db.commit()
    return {"ok": True}
