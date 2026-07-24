import Link from "next/link";

import { FeaturedArtists } from "@/components/home-featured-artists";
import { HomeHeroSlideshow } from "@/components/site-image-banner";
import { ShopByCategory } from "@/components/home-shop-by-category";

const kicker =
  "text-[11px] font-semibold uppercase tracking-[0.08em] text-premium-600";
const kickerOnDark =
  "text-[11px] font-semibold uppercase tracking-[0.08em] text-premium-100";
const sectionHeading =
  "font-sans text-[32px] sm:text-[40px] font-bold uppercase leading-[44px] tracking-tight text-ink";
const accent =
  "font-display font-medium normal-case italic tracking-normal";
const accentRed = `${accent} text-premium-600`;

const trustBar = ["Curated Indian artists", "Secure Razorpay checkout", "Made in India"];

export default function HomePage() {
  return (
    <div>
      {/* 1 · Hero — the single emotional anchor. Premium Red drench, story left / framed slider right */}
      <section className="bg-premium-600 px-4 py-[clamp(56px,7vw,96px)] sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-[clamp(40px,6vw,96px)] gap-y-12">
          <div className="flex min-w-[300px] flex-[1.4] flex-col items-start gap-6">
            <h1 className="font-sans text-[40px] sm:text-[56px] lg:text-[64px] font-bold uppercase leading-[68px] tracking-tight text-cream [word-spacing:0em]">
              Every wall deserves{" "}
              <em className={`${accent} text-cream`}>an art.</em>
            </h1>
            <p className="max-w-[560px] text-[16px] leading-[1.7] text-cream/90">
              Premium metal art from independent Indian artists
            </p>
            <div className="mt-2 flex flex-wrap gap-3.5">
              <Link
                href="/catalog"
                className="inline-flex h-[52px] items-center justify-center bg-ink px-10 text-xs font-semibold uppercase tracking-[0.06em] text-cream transition-colors hover:bg-cream hover:text-ink"
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

          {/* The one framed piece in the gallery: slow crossfade */}
          <div className="mx-auto w-full min-w-[264px] max-w-[460px] flex-1">
            <div className="bg-ink p-[5px] shadow-[0_30px_60px_rgba(27,23,23,0.35)]">
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
          <div className="mb-10 max-w-[560px]">
            <div className={`${kicker} mb-4`}>Shop by category</div>
            <h2 className={sectionHeading}>
              Find your <em className={accentRed}>next wall.</em>
            </h2>
          </div>
          <ShopByCategory />
        </div>
      </section>

      {/* 4 · Featured artists — a rotating spotlight on the people behind the work, Noir ground so real photos read */}
      <section className="bg-ink py-[clamp(56px,7vw,88px)]">
        <div className="container-page mb-12 text-center">
          <div className={`${kickerOnDark} mb-4`}>Featured artists</div>
          <h2 className="font-sans text-[28px] sm:text-[36px] font-bold uppercase leading-[44px] tracking-tight text-cream">
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

      {/* 5 · Sell on Wallmeri — the artist-facing CTA, Premium Red drench mirroring the hero */}
      <section className="bg-premium-600 px-4 py-[clamp(56px,7vw,88px)] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[720px] text-center">
          <div className={`${kickerOnDark} mb-4`}>Sell on Wallmeri</div>
          <h2 className="font-sans text-[32px] sm:text-[40px] font-bold uppercase leading-[46px] tracking-tight text-cream [text-wrap:balance]">
            Your art. Your wall.{" "}
            <em className={`${accent} text-cream`}>Your earnings.</em>
          </h2>
          <p className="mx-auto mt-5 max-w-[480px] text-base leading-[1.7] text-cream/90">
            List your work and reach collectors who want something original on
            their walls.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/artists/join"
              className="inline-flex h-[52px] items-center justify-center bg-ink px-10 text-xs font-semibold uppercase tracking-[0.06em] text-cream transition-colors hover:bg-cream hover:text-ink"
            >
              Join as an artist
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
