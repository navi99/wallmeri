"""Idempotent database seed: admin user, categories, and demo metal posters."""
from app.core.config import settings
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models import Category, Product, User

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


PRODUCTS = [
    # (title, category_slug, price_inr, featured, description)
    ("Crimson Tide", "abstract", 1799, True,
     "A bold abstract composition in flowing crimson and ivory tones, printed on premium matte metal."),
    ("Golden Horizon", "abstract", 1599, True,
     "Warm geometric gradients that catch the light from every angle."),
    ("Misty Pines", "nature", 1499, True,
     "A serene forest shrouded in morning mist, rendered with rich depth on brushed metal."),
    ("Mountain Dawn", "nature", 1699, False,
     "First light breaking over alpine peaks — calm, expansive, and grounding."),
    ("Nebula Drift", "space", 1999, True,
     "Deep-space nebula in soft pastels, vivid against the metal's subtle sheen."),
    ("Lunar Quiet", "space", 1899, False,
     "A minimalist moon study that brings a quiet focal point to any wall."),
    ("Neon Streets", "cities", 1799, True,
     "Rain-slicked city streets glowing with neon — a cinematic urban statement piece."),
    ("Skyline Dusk", "cities", 1599, False,
     "A pastel skyline at dusk, balancing warm and cool tones beautifully."),
    ("Retro Arcade", "gaming", 1499, False,
     "A nostalgic nod to classic arcades, full of playful colour and character."),
    ("Pixel Quest", "gaming", 1399, False,
     "Vibrant pixel-art landscape for the modern gamer's space."),
    ("Vinyl Soul", "music", 1499, True,
     "A tribute to analog sound — warm, textured, and timeless."),
    ("Sakura Spirit", "anime", 1699, True,
     "Delicate cherry-blossom anime art in soft pinks and reds."),
]


def seed() -> None:
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
        db.flush()

        # Products
        for title, cat_slug, price, featured, desc in PRODUCTS:
            from app.core.utils import slugify

            slug = slugify(title)
            existing = db.query(Product).filter(Product.slug == slug).first()
            if existing:
                continue
            product = Product(
                slug=slug,
                title=title,
                description=desc,
                price_inr=price,
                image_url=_img(slug),
                material="Brushed Metal",
                stock=50,
                is_active=True,
                is_featured=featured,
                category_id=cat_by_slug[cat_slug].id,
            )
            db.add(product)
            print(f"  + product {title}")

        db.commit()
        print("Seed complete.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
