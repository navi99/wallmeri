import Image from "@/components/app-image";
import Link from "next/link";

import { FeaturedArtists } from "@/components/home-featured-artists";
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

const heroSlides = [
  {
    src: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=880&q=80",
    alt: "Framed art glowing on a dark living-room wall, lit like a gallery",
  },
  {
    src: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?auto=format&fit=crop&w=880&q=80",
    alt: "A single framed print hung on a bright, quiet wall",
  },
  {
    src: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=880&q=80",
    alt: "Wall art anchoring a warm contemporary living room",
  },
];

const trustBar = [
  "Curated Indian artists",
  "Free shipping over ₹2,999",
  "Secure Razorpay checkout",
  "Made in India",
];

const howItWorks = [
  {
    n: "01",
    title: "Browse",
    body: "Discover original art, curated not crowd-sourced.",
  },
  {
    n: "02",
    title: "Order",
    body: "Printed to order on premium metal, made in India.",
  },
  {
    n: "03",
    title: "Hang",
    body: "Snaps onto a magnetic mount. No tools, no wall damage.",
  },
];

const whyWallmeri = [
  {
    n: "01",
    title: "Not paper, not canvas",
    body: "1mm premium aluminium, sublimation-printed for sharp, long-lasting colour.",
  },
  {
    n: "02",
    title: "No drilling",
    body: "A magnetic mount lets you hang or swap art in seconds.",
  },
  {
    n: "03",
    title: "Every artist credited and paid fairly",
    body: "No algorithmic feed, no self-serve uploads.",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* 1 · Hero — the single emotional anchor. Premium Red drench, story left / framed slider right */}
      <section className="bg-premium-600 px-[clamp(24px,5vw,64px)] py-[clamp(56px,7vw,96px)]">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-[clamp(40px,6vw,96px)] gap-y-12">
          <div className="flex min-w-[300px] flex-[1.4] flex-col items-start gap-6">
            <h1 className="font-sans text-[40px] sm:text-[56px] lg:text-[64px] font-bold uppercase leading-[68px] tracking-tight text-cream [word-spacing:0.1em]">
              Every wall deserves{" "}
              <em className={`${accent} text-cream`}>an art.</em>
            </h1>
            <p className="max-w-[560px] text-[16px] leading-[1.7] text-cream/90">
              Premium metal art from independent Indian artists —
              sublimation-printed, magnetic-mounted, no drilling required.
            </p>
            <div className="mt-2 flex flex-wrap gap-3.5">
              <Link
                href="/catalog"
                className="inline-flex h-[52px] items-center justify-center bg-ink px-9 text-xs font-semibold uppercase tracking-[0.06em] text-cream transition-colors hover:bg-cream hover:text-ink"
              >
                Shop the gallery
              </Link>
              <Link
                href="/artists"
                className="inline-flex h-[52px] items-center justify-center border border-cream/50 px-9 text-xs font-semibold uppercase tracking-[0.06em] text-cream transition-colors hover:border-cream hover:bg-cream hover:text-ink"
              >
                Meet the artists
              </Link>
            </div>
          </div>

          {/* The one framed piece in the gallery: Noir frame, slow crossfade */}
          <div className="mx-auto w-full min-w-[264px] max-w-[400px] flex-1">
            <div className="bg-ink p-[14px] shadow-[0_30px_60px_rgba(27,23,23,0.35)]">
              <div className="relative aspect-[3/4] overflow-hidden">
                {heroSlides.map((slide, i) => (
                  <Image
                    key={slide.src}
                    src={slide.src}
                    alt={slide.alt}
                    fill
                    priority={i === 0}
                    sizes="(max-width: 640px) 90vw, 400px"
                    className="about-slide object-cover"
                    style={{ animationDelay: `${i * 4}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2 · Trust bar — the badges buyers need before they'll browse, promoted up from the footer */}
      <section className="border-b border-ink/10 bg-paper">
        <div className="container-page flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2 py-5 text-center">
          {trustBar.map((item, i) => (
            <span key={item} className="flex items-center gap-2.5">
              {i > 0 && <span className="text-premium-600">●</span>}
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink/70">
                {item}
              </span>
            </span>
          ))}
        </div>
      </section>

      {/* 3 · How it works — three steps, no more */}
      <section className="container-page py-[clamp(56px,7vw,96px)]">
        <div className="mb-14 max-w-[560px]">
          <div className={`${kicker} mb-4`}>How it works</div>
          <h2 className={sectionHeading}>
            Browse. Order. <em className={accentRed}>Hang.</em>
          </h2>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-x-10 gap-y-12">
          {howItWorks.map((step) => (
            <div key={step.n} className="flex flex-col gap-4">
              <div className="font-display text-[52px] italic leading-none text-premium-600">
                {step.n}
              </div>
              <div className="text-[13px] font-semibold uppercase tracking-[0.06em] text-ink">
                {step.title}
              </div>
              <p className="text-[15px] leading-[1.7] text-muted">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4 · Shop by category — live catalog taxonomy */}
      <section className="border-y border-ink/10 bg-paper">
        <div className="container-page py-[clamp(56px,7vw,96px)]">
          <div className="mb-10 max-w-[560px]">
            <div className={`${kicker} mb-4`}>Shop by category</div>
            <h2 className={sectionHeading}>
              Find your <em className={accentRed}>next wall.</em>
            </h2>
          </div>
          <ShopByCategory />
        </div>
      </section>

      {/* 5 · Featured artists — a rotating spotlight on the people behind the work, Noir ground so real photos read */}
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
            className="inline-flex h-[52px] items-center justify-center border border-cream/40 px-9 text-xs font-semibold uppercase tracking-[0.06em] text-cream transition-colors hover:border-cream hover:bg-cream hover:text-ink"
          >
            View all artists
          </Link>
        </div>
      </section>

      {/* 6 · Why Wallmeri — the strongest claims from About, surfaced on Home too */}
      <section className="container-page flex flex-wrap items-center gap-[clamp(40px,5vw,72px)] py-[clamp(56px,7vw,96px)]">
        <div className="relative h-[460px] min-w-[300px] flex-1 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1531913764164-f85c52e6e654?auto=format&fit=crop&w=900&q=80"
            alt="Bold, colour-saturated abstract artwork, the kind of piece Wallmeri prints on metal"
            fill
            sizes="(max-width: 768px) 90vw, 460px"
            className="object-cover"
          />
        </div>
        <div className="flex min-w-[300px] max-w-[460px] flex-1 flex-col gap-7">
          <div>
            <div className={kicker}>Why Wallmeri</div>
            <h2 className="mt-3 font-sans text-[28px] sm:text-[36px] font-bold uppercase leading-[1.1] tracking-tight text-ink">
              Built to be <em className={accentRed}>collected.</em>
            </h2>
          </div>
          <div className="flex flex-col">
            {whyWallmeri.map((v, i) => (
              <div
                key={v.n}
                className={`flex gap-5 border-t border-ink/15 py-[22px] ${
                  i === whyWallmeri.length - 1 ? "border-b" : ""
                }`}
              >
                <span className="font-display shrink-0 text-[15px] italic text-premium-600">
                  {v.n}
                </span>
                <p className="text-[15px] leading-[1.6] text-muted">
                  <span className="font-semibold text-ink">{v.title}.</span> {v.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7 · Sell on Wallmeri — the artist-facing CTA, Premium Red drench mirroring the hero */}
      <section className="bg-premium-600 px-[clamp(24px,5vw,64px)] py-[clamp(56px,7vw,88px)]">
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
              className="inline-flex h-[52px] items-center justify-center bg-ink px-9 text-xs font-semibold uppercase tracking-[0.06em] text-cream transition-colors hover:bg-cream hover:text-ink"
            >
              Join as an artist
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
