import Link from "next/link";

import { FeaturedArtists } from "@/components/home-featured-artists";
import { FeaturedProducts } from "@/components/home-featured-products";
import { HomeHeroMedia } from "@/components/site-image-banner";
import { HomeMarquee } from "@/components/home-marquee";
import { ShopByCategory } from "@/components/home-shop-by-category";

const kicker =
  "text-[11px] font-semibold uppercase tracking-[0.08em] text-premium-600";
const kickerOnDark =
  "text-[11px] font-semibold uppercase tracking-[0.08em] text-premium-100";
const sectionHeading =
  "font-sans text-[32px] sm:text-[40px] font-bold uppercase leading-[44px] tracking-[0.02em] text-ink [text-wrap:balance]";
const accent =
  "font-display font-medium normal-case italic tracking-normal";
const accentRed = `${accent} text-premium-600`;

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
            <div className={`${kickerOnDark} motion-safe:animate-hero-rise-1`}>Wallmeri</div>
            <h1 className="font-sans max-w-[720px] text-[32px] leading-[40px] sm:text-[48px] sm:leading-[54px] lg:text-[64px] lg:leading-[68px] font-bold uppercase tracking-[0.01em] text-cream [word-spacing:0em] [text-wrap:balance] motion-safe:animate-hero-rise-2">
              Every wall deserves{" "}
              <em className={`${accent} text-cream`}>an art.</em>
            </h1>
            <p className="max-w-[480px] text-[16px] leading-[1.7] text-cream/80 motion-safe:animate-hero-rise-3">
              Premium metal art from independent Indian artists
            </p>
            <div className="mt-2 flex flex-wrap gap-3.5 motion-safe:animate-hero-rise-4">
              <Link
                href="/catalog"
                className="inline-flex h-[52px] items-center justify-center bg-premium-600 px-10 text-xs font-semibold uppercase tracking-[0.06em] text-cream transition-colors hover:bg-premium-700"
              >
                Shop the gallery
              </Link>
              <Link
                href="/artists"
                className="inline-flex h-[52px] items-center justify-center border border-cream/50 px-10 text-xs font-semibold uppercase tracking-[0.06em] text-cream transition-colors hover:border-cream hover:bg-cream hover:text-ink"
              >
                Meet the artists
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2 · Trust marquee — the badges buyers need before they'll browse, scrolling instead of static so it reads as a signal strip, not another line of copy */}
      <HomeMarquee items={trustMarquee} />

      {/* 3 · Shop by category — live catalog taxonomy */}
      <section className="border-y border-ink/10 bg-paper">
        <div className="container-page pb-[clamp(56px,7vw,96px)] pt-[clamp(32px,4vw,48px)]">
          <div className="mx-auto mb-12 max-w-[560px] text-center">
            <div className={`${kicker} mb-4`}>Shop by category</div>
            <h2 className={sectionHeading}>
              Find your <em className={accentRed}>next wall.</em>
            </h2>
          </div>
          <ShopByCategory />
        </div>
      </section>

      {/* 3.5 · Featured pieces — a small curated shelf, spotlight-glow tiles */}
      <section className="bg-cream">
        <div className="container-page py-[clamp(56px,7vw,88px)]">
          <div className="mx-auto mb-12 max-w-[560px] text-center">
            <div className={`${kicker} mb-4`}>Featured pieces</div>
            <h2 className={sectionHeading}>
              A closer <em className={accentRed}>look.</em>
            </h2>
          </div>
          <FeaturedProducts />
        </div>
      </section>

      {/* 4 · Featured artists — a rotating spotlight on the people behind the work, Noir ground so real photos read */}
      <section className="bg-ink py-[clamp(56px,7vw,88px)]">
        <div className="container-page mb-12 text-center">
          <div className={`${kickerOnDark} mb-4`}>Featured artists</div>
          <h2 className="font-sans text-[28px] sm:text-[36px] font-bold uppercase leading-[44px] tracking-[0.02em] text-cream [text-wrap:balance]">
            Artists worth <em className={`${accent} text-cream`}>knowing.</em>
          </h2>
          <p className="mx-auto mt-3 max-w-[440px] text-base leading-[1.7] text-cream/60">
            A rotating spotlight on the people behind the work.
          </p>
        </div>
        <div className="container-page mb-11">
          <FeaturedArtists />
        </div>
        <div className="text-center">
          <Link
            href="/artists"
            className="inline-flex h-[52px] items-center justify-center border border-cream/40 px-10 text-xs font-semibold uppercase tracking-[0.06em] text-cream transition-colors hover:border-cream hover:bg-cream hover:text-ink"
          >
            View all artists
          </Link>
        </div>
      </section>

      {/* 5 · Sell on Wallmeri — the artist-facing CTA. Quiet Paper band; red stays confined to the kicker/accent/hover, no drench */}
      <section className="border-t border-ink/10 bg-paper px-4 py-[clamp(56px,7vw,88px)] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[720px] text-center">
          <div className={`${kicker} mb-4`}>Sell on Wallmeri</div>
          <h2 className="font-sans text-[32px] sm:text-[40px] font-bold uppercase leading-[46px] tracking-[0.02em] text-ink [text-wrap:balance]">
            Your art. Your wall. <em className={accentRed}>Your earnings.</em>
          </h2>
          <p className="mx-auto mt-5 max-w-[480px] text-base leading-[1.7] text-muted">
            List your work and reach collectors who want something original on
            their walls.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/artists/join"
              className="inline-flex h-[52px] items-center justify-center bg-ink px-10 text-xs font-semibold uppercase tracking-[0.06em] text-cream transition-colors hover:bg-premium-600 active:bg-premium-700"
            >
              Join as an artist
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
