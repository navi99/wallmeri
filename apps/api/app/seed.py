"""Idempotent database seed: admin user, categories, and artists."""
import sys

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models import Artist, Category, User

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
        for name, slug in CATEGORIES:
            if not db.query(Category).filter(Category.slug == slug).first():
                db.add(Category(name=name, slug=slug))
                print(f"  + category {name}")

        # Artists (seeded fully verified + active so the demo store works out of the box)
        for data in ARTISTS:
            if not db.query(Artist).filter(Artist.slug == data["slug"]).first():
                db.add(
                    Artist(
                        **data,
                        identity_verified=True,
                        agreement_received=True,
                        contact_verified=True,
                        is_active=True,
                    )
                )
                print(f"  + artist {data['name']}")

        db.commit()
        print("Seed complete.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
