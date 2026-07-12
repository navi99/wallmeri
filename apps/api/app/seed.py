"""Idempotent database seed: admin user, categories, artists, and demo metal posters."""
import sys

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.core.utils import slugify
from app.models import Artist, Category, Product, User

CATEGORIES = [
    ("Abstract", "abstract"),
    ("Nature", "nature"),
    ("Space", "space"),
    ("Movies", "movies"),
    ("Gaming", "gaming"),
    ("Music", "music"),
    ("Anime", "anime"),
    ("Cities", "cities"),
]


def _img(seed: str) -> str:
    return f"https://picsum.photos/seed/{seed}/900/1200"


ARTISTS = [
    {
        "name": "Meera Iyer",
        "slug": "meera-iyer",
        "bio": (
            "Chennai-based abstract artist exploring colour, rhythm and light. "
            "Meera's work blends traditional South Indian palettes with bold modern forms."
        ),
        "avatar_url": "https://picsum.photos/seed/meera-iyer/400/400",
        "instagram_url": "https://instagram.com/meera.paints",
    },
    {
        "name": "Arjun Verma",
        "slug": "arjun-verma",
        "bio": (
            "Digital illustrator from Pune. Arjun creates cinematic cityscapes and "
            "sci-fi worlds inspired by night trains, monsoon streets and retro games."
        ),
        "avatar_url": "https://picsum.photos/seed/arjun-verma/400/400",
        "website_url": "https://arjunverma.art",
    },
]

PRODUCTS = [
    # (title, [category_slugs], artist_slug or None, price_inr, featured, description)
    ("Crimson Tide", ["abstract"], "meera-iyer", 1799, True,
     "A bold abstract composition in flowing crimson and ivory tones, printed on premium matte metal."),
    ("Golden Horizon", ["abstract"], "meera-iyer", 1599, True,
     "Warm geometric gradients that catch the light from every angle."),
    ("Misty Pines", ["nature"], None, 1499, True,
     "A serene forest shrouded in morning mist, rendered with rich depth on brushed metal."),
    ("Mountain Dawn", ["nature"], None, 1699, False,
     "First light breaking over alpine peaks — calm, expansive, and grounding."),
    ("Nebula Drift", ["space", "abstract"], "meera-iyer", 1999, True,
     "Deep-space nebula in soft pastels, vivid against the metal's subtle sheen."),
    ("Lunar Quiet", ["space"], None, 1899, False,
     "A minimalist moon study that brings a quiet focal point to any wall."),
    ("Neon Streets", ["cities"], "arjun-verma", 1799, True,
     "Rain-slicked city streets glowing with neon — a cinematic urban statement piece."),
    ("Skyline Dusk", ["cities"], "arjun-verma", 1599, False,
     "A pastel skyline at dusk, balancing warm and cool tones beautifully."),
    ("Retro Arcade", ["gaming"], "arjun-verma", 1499, False,
     "A nostalgic nod to classic arcades, full of playful colour and character."),
    ("Pixel Quest", ["gaming", "cities"], "arjun-verma", 1399, False,
     "Vibrant pixel-art landscape for the modern gamer's space."),
    ("Vinyl Soul", ["music"], None, 1499, True,
     "A tribute to analog sound — warm, textured, and timeless."),
    ("Sakura Spirit", ["anime"], None, 1699, True,
     "Delicate cherry-blossom anime art in soft pinks and reds."),
]


def seed() -> None:
    if settings.ENV == "production" and settings.ADMIN_PASSWORD == "admin12345":
        print(
            "FATAL: refusing to seed production with the default admin password. "
            "Set a strong ADMIN_PASSWORD."
        )
        sys.exit(1)

    db = SessionLocal()
    try:
        # Admin user
        admin = db.query(User).filter(User.email == settings.ADMIN_EMAIL.lower()).first()
        if not admin:
            admin = User(
                email=settings.ADMIN_EMAIL.lower(),
                password_hash=hash_password(settings.ADMIN_PASSWORD),
                full_name=settings.ADMIN_NAME,
                is_admin=True,
            )
            db.add(admin)
            print(f"  + admin user {settings.ADMIN_EMAIL}")

        # Categories
        cat_by_slug: dict[str, Category] = {}
        for name, slug in CATEGORIES:
            cat = db.query(Category).filter(Category.slug == slug).first()
            if not cat:
                cat = Category(name=name, slug=slug)
                db.add(cat)
                print(f"  + category {name}")
            cat_by_slug[slug] = cat

        # Artists (seeded fully verified + active so the demo store works out of the box)
        artist_by_slug: dict[str, Artist] = {}
        for data in ARTISTS:
            artist = db.query(Artist).filter(Artist.slug == data["slug"]).first()
            if not artist:
                artist = Artist(
                    **data,
                    identity_verified=True,
                    agreement_received=True,
                    contact_verified=True,
                    is_active=True,
                )
                db.add(artist)
                print(f"  + artist {data['name']}")
            artist_by_slug[data["slug"]] = artist
        db.flush()

        # Products
        for title, cat_slugs, artist_slug, price, featured, desc in PRODUCTS:
            slug = slugify(title)
            existing = db.query(Product).filter(Product.slug == slug).first()
            if existing:
                # Backfill links on products created before the artist/M2M schema.
                if existing.artist_id is None and artist_slug:
                    existing.artist_id = artist_by_slug[artist_slug].id
                    print(f"  ~ linked {title} -> {artist_slug}")
                have = {c.slug for c in existing.categories}
                missing = [cat_by_slug[s] for s in cat_slugs if s not in have]
                if missing:
                    existing.categories.extend(missing)
                    print(f"  ~ tagged {title} with {[c.slug for c in missing]}")
                continue
            product = Product(
                slug=slug,
                title=title,
                description=desc,
                price_inr=price,
                image_url=_img(slug),
                material="Brushed Metal",
                is_active=True,
                is_featured=featured,
                artist_id=artist_by_slug[artist_slug].id if artist_slug else None,
                categories=[cat_by_slug[s] for s in cat_slugs],
            )
            db.add(product)
            print(f"  + product {title}")

        db.commit()
        print("Seed complete.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
