import Link from "next/link";

import { FeaturedArtists } from "@/components/home-featured-artists";
import { FeaturedProducts } from "@/components/home-featured-products";
import { HomeHeroSlideshow } from "@/components/site-image-banner";
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

const trustBar = ["Curated Indian artists", "Secure Razorpay checkout", "Made in India"];

export default function HomePage() {
  return (
    <div>
      {/* 1 · Hero — the framed piece is the focal point; story sits beside it as
          support, not competition. Cotton canvas, mirrors the About hero; red
          is saved for the bands below. */}
      <section className="px-[clamp(20px,5vw,64px)] py-[clamp(48px,7vw,104px)]">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-[clamp(32px,6vw,96px)] gap-y-10">
          <div className="flex min-w-[280px] flex-1 flex-col items-start gap-6">
            <div className={`${kicker} motion-safe:animate-hero-rise-1`}>Wallmeri</div>
            <h1 className="font-sans text-[32px] leading-[40px] sm:text-[48px] sm:leading-[54px] lg:text-[64px] lg:leading-[68px] font-bold uppercase tracking-[0.01em] text-ink [word-spacing:0em] [text-wrap:balance] motion-safe:animate-hero-rise-2">
              Every wall deserves{" "}
              <em className={accentRed}>an art.</em>
            </h1>
            <p className="max-w-[480px] text-[16px] leading-[1.7] text-muted motion-safe:animate-hero-rise-3">
              Premium metal art from independent Indian artists
            </p>
            <div className="mt-2 flex flex-wrap gap-3.5 motion-safe:animate-hero-rise-4">
              <Link
                href="/catalog"
                className="inline-flex h-[52px] items-center justify-center bg-ink px-10 text-xs font-semibold uppercase tracking-[0.06em] text-cream transition-colors hover:bg-premium-600 active:bg-premium-700"
              >
                Shop the gallery
              </Link>
              <Link
                href="/artists"
                className="inline-flex h-[52px] items-center justify-center border border-ink px-10 text-xs font-semibold uppercase tracking-[0.06em] text-ink transition-colors hover:bg-ink hover:text-cream"
              >
                Meet the artists
              </Link>
            </div>
          </div>

          {/* The one framed piece in the gallery — enlarged to lead the hero,
              14px Noir frame + a deep, red-tinted drop shadow per DESIGN.md's
              "Hero frame" spec, so the art itself reads as the focal point.
              Settles in last (after the text has staggered through), then
              gives a quiet tilt-and-lift on hover/focus — the same "earned
              lift" language product cards use on interaction. */}
          <div className="group mx-auto w-full min-w-[280px] max-w-[560px] flex-[1.2] motion-safe:animate-hero-rise-delayed [perspective:1200px]">
            <div className="bg-ink p-[14px] shadow-[0_1px_2px_rgba(27,23,23,0.05),0_40px_70px_-15px_rgba(143,27,26,0.28)] transition-transform duration-500 ease-out motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:[transform:rotateX(1.5deg)_rotateY(-2deg)]">
              <div className="relative aspect-[3/4] overflow-hidden">
                <HomeHeroSlideshow />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2 · Trust bar — the badges buyers need before they'll browse, promoted up from the footer */}
      <section className="border-b border-ink/10 bg-paper">
        <div className="container-page flex flex-wrap items-center justify-center gap-x-8 gap-y-2 py-5 text-center sm:gap-x-14">
          {trustBar.map((item) => (
            <span key={item} className="flex items-center gap-2.5">
              <span className="text-premium-600">●</span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink/70">
                {item}
              </span>
            </span>
          ))}
        </div>
      </section>

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
