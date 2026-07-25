import Link from "next/link";

import { FeaturedArtists } from "@/components/home-featured-artists";
import { FeaturedProducts } from "@/components/home-featured-products";
import { HomeHeroMedia } from "@/components/site-image-banner";
import { HomeMarquee } from "@/components/home-marquee";
import { ShopByCategory } from "@/components/home-shop-by-category";

// Section chrome now comes from globals.css (.kicker / .title-lg / .accent) —
// the local heading string was the original source of the ad-hoc drift.
// Caps come from the ladder itself now (The Caps-Heading Rule) — what's local
// to home is that every section heading closes on a lowercase Cormorant phrase
// in Premium Red. See DESIGN.md, The Engraving Rule.
const sectionHeading = "title-lg [text-wrap:balance]";

const trustMarquee = [
  "Curated Indian artists",
  "Free shipping over ₹2,999",
  "Secure Razorpay checkout",
  "Made in India",
  "Museum-grade metal",
  "No drilling · magnetic mount",
];

export default function HomePage() {
  return (
    <div>
      {/* 1 · Hero — full-bleed video (falls back to the admin's poster image,
          then a plain Noir panel) with a bottom Noir scrim so the overlaid
          copy stays legible against whatever's playing. Text is Cotton on
          the dark hero per DESIGN.md's No-Pure-White rule; red stays confined
          to the kicker and the primary CTA's hover state. */}
      <section className="relative flex min-h-[clamp(560px,82vh,860px)] items-end overflow-hidden bg-ink">
        <HomeHeroMedia />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-ink/5"
        />
        <div className="relative w-full px-[clamp(20px,5vw,64px)] py-[clamp(40px,6vw,80px)]">
          <div className="mx-auto flex max-w-[1180px] flex-col items-start gap-6">
            {/* No scrim panel behind the copy — the section's own bottom Noir
                gradient above is what keeps the text legible, so the words sit
                directly on the video with nothing framing them. */}
            <div className="flex flex-col items-start gap-4">
              <div className="kicker-on-dark motion-safe:animate-hero-rise-1">Wallmeri</div>
              {/* Caps Montserrat closed by one lowercase Cormorant phrase. The
                  accent takes premium-300 here rather than the class default:
                  Premium Red on the Noir scrim is ~2.3:1, while premium-300
                  clears 7:1. */}
              <h1 className="title-display max-w-[860px] text-cream [text-wrap:balance] motion-safe:animate-hero-rise-2">
                Every wall deserves <em className="accent text-premium-300">an art.</em>
              </h1>
              <p className="max-w-[480px] text-base leading-[1.7] text-cream/75 motion-safe:animate-hero-rise-3">
                Premium metal art from independent Indian artists
              </p>
            </div>
            <div className="mt-2 flex flex-wrap gap-3.5 motion-safe:animate-hero-rise-4">
              <Link
                href="/catalog"
                className="label inline-flex h-14 items-center justify-center bg-premium-600 px-10 text-cream transition-colors hover:bg-premium-700"
              >
                Shop the gallery
              </Link>
              <Link
                href="/artists"
                className="label inline-flex h-14 items-center justify-center border border-cream/50 px-10 text-cream transition-colors hover:border-cream hover:bg-cream hover:text-ink"
              >
                Meet the artists
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2 · Trust marquee — the badges buyers need before they'll browse, scrolling instead of static so it reads as a signal strip, not another line of copy */}
      <HomeMarquee items={trustMarquee} />

      {/* 3–4 · The three gallery-wall bands (2026-07-25). All three share the
          MediaRail geometry: a centered heading held inside container-page,
          then a full-bleed row of bare tiles running off both edges of the
          viewport with the label set on the surface beneath. Nothing frames
          the art — no card, no border, no resting shadow. */}

      {/* 3 · Shop by category — live catalog taxonomy */}
      <section className="border-y border-line bg-paper py-[clamp(64px,7vw,112px)]">
        <div className="container-page mb-[clamp(32px,4vw,52px)]">
          <div className="mx-auto max-w-[560px] text-center">
            <div className="kicker mb-4">Shop by category</div>
            <h2 className={sectionHeading}>
              Find your <em className="accent">next wall.</em>
            </h2>
          </div>
        </div>
        <ShopByCategory />
      </section>

      {/* 3.5 · Featured pieces — a small curated shelf, five across */}
      <section className="bg-cream py-[clamp(64px,7vw,112px)]">
        <div className="container-page mb-[clamp(32px,4vw,52px)]">
          <div className="mx-auto max-w-[560px] text-center">
            <div className="kicker mb-4">Featured pieces</div>
            <h2 className={sectionHeading}>
              A closer <em className="accent">look.</em>
            </h2>
          </div>
        </div>
        <FeaturedProducts />
      </section>

      {/* 4 · Featured artists — a rotating spotlight on the people behind the
          work. Same tile size/shape and plaque voice as the featured pieces
          above; Paper ground with a hairline at the top so the two light bands
          read as separate runs rather than one long stretch. (No border-b —
          the Sell band below already carries a border-t.) */}
      <section className="border-t border-line bg-paper py-[clamp(64px,7vw,112px)]">
        <div className="container-page mb-[clamp(32px,4vw,52px)] text-center">
          <div className="kicker mb-4">Featured artists</div>
          <h2 className={sectionHeading}>
            Artists worth <em className="accent">knowing.</em>
          </h2>
          <p className="mx-auto mt-3 max-w-[440px] text-base leading-[1.7] text-muted">
            A rotating spotlight on the people behind the work.
          </p>
        </div>
        <FeaturedArtists />
        <div className="mt-[clamp(36px,4vw,56px)] text-center">
          <Link
            href="/artists"
            className="label inline-flex h-14 items-center justify-center border border-ink px-10 text-ink transition-colors hover:bg-ink hover:text-cream"
          >
            View all artists
          </Link>
        </div>
      </section>

      {/* 5 · Sell on Wallmeri — the artist-facing CTA. Quiet Paper band; red stays confined to the kicker/accent/hover, no drench */}
      <section className="border-t border-line bg-paper px-4 py-[clamp(64px,7vw,112px)] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[720px] text-center">
          <div className="kicker mb-4">Sell on Wallmeri</div>
          <h2 className={sectionHeading}>
            Your art. Your wall. <em className="accent">Your earnings.</em>
          </h2>
          <p className="mx-auto mt-5 max-w-[480px] text-base leading-[1.7] text-muted">
            List your work and reach collectors who want something original on
            their walls.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/artists/join"
              className="label inline-flex h-14 items-center justify-center bg-ink px-10 text-cream transition-colors hover:bg-premium-600 active:bg-premium-700"
            >
              Join as an artist
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
