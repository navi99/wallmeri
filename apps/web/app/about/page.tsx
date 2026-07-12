import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | Wallmeri",
  description:
    "Wallmeri turns original Indian creativity into premium metal wall art, helping artists get discovered, recognised and rewarded, while giving every home a wall that means something.",
};

const kicker =
  "text-[11px] font-semibold uppercase tracking-[0.28em] text-premium-600";
const kickerOnRed =
  "text-[11px] font-semibold uppercase tracking-[0.28em] text-premium-100";
const sectionHeading =
  "font-sans text-[clamp(28px,3.4vw,40px)] font-bold uppercase leading-[1.1] tracking-tight text-ink";
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

const steps = [
  {
    n: "01",
    title: "Discover",
    body: "We find and curate original Indian artists whose work deserves more than a scroll. No self-serve uploads, no algorithmic feed.",
  },
  {
    n: "02",
    title: "License & reward",
    body: "Artists license their work through a simple, fair agreement and earn on every single sale, with their name on every piece.",
  },
  {
    n: "03",
    title: "Print on metal",
    body: "Each artwork is sublimation-printed onto premium metal with colours fused into the surface, made to order in India.",
  },
  {
    n: "04",
    title: "Find a wall",
    body: "The piece ships across India and snaps onto a magnetic mount, going from an artist's screen to a wall where it's actually seen.",
  },
];

const materialFacts = [
  {
    title: "Premium metal",
    body: "A rigid, lightweight sheet with a distinctive modern finish. Steel, not paper.",
  },
  {
    title: "Sublimation print",
    body: "Colours are fused into the surface for sharp, vivid, long-lasting artwork.",
  },
  {
    title: "Magnetic mounting",
    body: "Snaps onto the wall with no drilling or damage. Swap artwork in seconds.",
  },
];

const values = [
  {
    n: "01",
    title: "Fair pay",
    body: "Every decision starts with the question: does this serve the artist? Attribution, fair earnings, and a dignified stage are non-negotiable.",
  },
  {
    n: "02",
    title: "Honest quality",
    body: "We oversee materials, printing and packaging ourselves. If a piece wouldn't hang on our own wall, it doesn't ship to yours.",
  },
  {
    n: "03",
    title: "Responsible growth",
    body: "We build slowly and deliberately, prioritising a curated catalog and honest relationships over scale for its own sake.",
  },
];

const vision = [
  {
    label: "Today",
    body: "Original Indian art on premium metal, curated piece by piece.",
  },
  {
    label: "Next",
    body: "More artists, more mediums, more walls across India.",
  },
  {
    label: "Growing",
    body: "A stronger stage for independent Indian creativity, one collection at a time.",
  },
  {
    label: "Always",
    body: "Back to artists: the recognition and reward they deserve.",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* 1 · Hero — the single emotional anchor. Premium Red drench, story left / framed slider right */}
      <section className="bg-premium-600 px-[clamp(24px,5vw,64px)] py-[clamp(56px,7vw,96px)]">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-[clamp(40px,6vw,96px)] gap-y-12">
          <div className="flex min-w-[300px] flex-[1.4] flex-col items-start gap-6">
            <div className={kickerOnRed}>The Wallmeri story</div>
            <h1 className="font-sans text-[clamp(38px,5vw,64px)] font-bold uppercase leading-[1.05] tracking-tight text-cream">
              Every artist deserves{" "}
              <em className={`${accent} text-cream`}>a wall.</em>
            </h1>
            <p className="max-w-[560px] text-[16px] leading-[1.7] text-cream/90">
              We turn original Indian creativity into premium metal art,
              helping artists get discovered, recognised and rewarded, while
              giving every home a wall that means something.
            </p>
            <div className="mt-2 flex flex-wrap gap-3.5">
              <Link
                href="/catalog"
                className="inline-flex h-[52px] items-center justify-center bg-ink px-9 text-xs font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-cream hover:text-ink"
              >
                Explore the art
              </Link>
              <Link
                href="/artists/join"
                className="inline-flex h-[52px] items-center justify-center border border-cream/50 px-9 text-xs font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:border-cream hover:bg-cream hover:text-ink"
              >
                Join as an artist
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

      {/* 2 · Our story — the problem, then the answer, told once */}
      <section className="container-page flex flex-wrap items-start gap-x-[clamp(40px,5vw,72px)] gap-y-8 py-[clamp(56px,7vw,96px)]">
        <div className="flex min-w-[300px] max-w-[440px] flex-1 flex-col gap-4">
          <div className={kicker}>Our story</div>
          <h2 className={sectionHeading}>
            Thousands create.{" "}
            <em className={accentRed}>Too few get seen.</em>
          </h2>
        </div>
        <div className="flex min-w-[300px] max-w-[520px] flex-1 flex-col gap-[22px]">
          <p className="text-base leading-[1.7] text-ink/70">
            Every day, talented Indian artists create work full of emotion,
            skill and identity, yet much of it remains trapped on a screen:
            seen for a few seconds, liked, and eventually lost in an endless
            feed.
          </p>
          <p className="text-base font-semibold leading-[1.7] text-ink">
            That felt wrong to us. So we built Wallmeri, a bridge between
            Indian artists and the walls their work belongs on.
          </p>
        </div>
      </section>

      {/* 3 · Mission — the statement, with our values as its supporting bullets */}
      <section className="container-page flex flex-wrap items-start gap-[clamp(40px,5vw,72px)] pb-[clamp(56px,7vw,96px)]">
        <div className="flex min-w-[300px] max-w-[520px] flex-1 flex-col gap-[22px]">
          <div className={kicker}>Our mission</div>
          <h2 className={sectionHeading}>
            Our mission is <em className={accentRed}>simple.</em>
          </h2>
          <p className="text-base leading-[1.7] text-ink/70">
            Give independent Indian artists a fair way to turn their work into
            recognition and income &mdash; and help people put something
            genuine, personal and meaningful on their walls.
          </p>
          <p className="text-base font-semibold leading-[1.7] text-ink">
            Every purchase helps creative work find a home.
          </p>
        </div>
        <div className="grid min-w-[280px] flex-1 gap-5">
          {values.map((v) => (
            <div key={v.n} className="border border-ink/10 bg-paper p-7">
              <div className="flex items-baseline gap-4">
                <div className="font-display text-[32px] italic leading-none text-premium-600">
                  {v.n}
                </div>
                <div className="text-[13px] font-semibold uppercase tracking-[0.16em] text-ink">
                  {v.title}
                </div>
              </div>
              <p className="mt-3 text-[15px] leading-[1.7] text-muted">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4 · How it works — the four steps, with the material facts as supporting detail */}
      <section className="border-y border-ink/10 bg-paper">
        <div className="container-page py-[clamp(56px,7vw,96px)]">
          <div className="mb-14 max-w-[560px]">
            <div className={`${kicker} mb-4`}>How it works</div>
            <h2 className={sectionHeading}>
              From an artist&apos;s screen{" "}
              <em className={accentRed}>to your wall.</em>
            </h2>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-x-10 gap-y-12">
            {steps.map((step) => (
              <div key={step.n} className="flex flex-col gap-4">
                <div className="font-display text-[52px] italic leading-none text-premium-600">
                  {step.n}
                </div>
                <div className="text-[13px] font-semibold uppercase tracking-[0.16em] text-ink">
                  {step.title}
                </div>
                <p className="text-[15px] leading-[1.7] text-muted">{step.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-14 border-t border-ink/10 pt-10">
            <div className={`${kicker} mb-8`}>
              The material &mdash; not paper, not canvas
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-x-10 gap-y-8">
              {materialFacts.map((item) => (
                <div key={item.title}>
                  <div className="text-[13px] font-semibold uppercase tracking-[0.16em] text-ink">
                    {item.title}
                  </div>
                  <p className="mt-2.5 text-[15px] leading-[1.7] text-muted">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5 · Vision — Premium Red drench, paired with Mission above */}
      <section className="bg-premium-600 px-[clamp(24px,5vw,64px)] py-[clamp(56px,7vw,88px)]">
        <div className="mb-14 text-center">
          <div className={`${kickerOnRed} mb-4`}>Our vision</div>
          <h2 className="mx-auto max-w-[720px] font-sans text-[clamp(28px,3.4vw,40px)] font-bold uppercase leading-[1.15] tracking-tight text-cream [text-wrap:balance]">
            A trusted home for Indian{" "}
            <em className={`${accent} text-cream`}>creative work.</em>
          </h2>
          <p className="mx-auto mt-5 max-w-[560px] text-base leading-[1.7] text-cream/90">
            A place where photographers, illustrators, designers and
            independent creators of every kind get seen, credited and
            rewarded.
          </p>
        </div>
        <div className="mx-auto grid max-w-[1100px] grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5">
          {vision.map((v) => (
            <div key={v.label} className="border border-cream/30 p-7">
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-premium-100">
                {v.label}
              </div>
              <p className="mt-3.5 text-[15px] leading-[1.7] text-cream/90">
                {v.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6 · Sign-off — Made in India, a single compact band */}
      <section className="container-page flex flex-wrap items-center justify-between gap-x-[clamp(32px,4vw,56px)] gap-y-7 py-[clamp(40px,5vw,64px)]">
        <div className="flex min-w-[300px] max-w-[620px] flex-1 flex-col gap-3">
          <div className={kicker}>Where we come from</div>
          <h2 className="font-sans text-[clamp(24px,2.8vw,34px)] font-bold uppercase leading-[1.12] tracking-tight text-ink">
            Proudly made in India.{" "}
            <em className={accentRed}>Built in Bengaluru.</em>
          </h2>
          <p className="text-base leading-[1.7] text-ink/70">
            This is only the beginning &mdash; for Wallmeri, for the artists
            already creating with us, and for the thousands of talented
            creators we are yet to discover.
          </p>
        </div>
        <div className="flex flex-wrap gap-3.5">
          <Link
            href="/catalog"
            className="inline-flex h-[52px] items-center justify-center bg-premium-600 px-9 text-xs font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-ink"
          >
            Shop the gallery
          </Link>
          <Link
            href="/artists/join"
            className="inline-flex h-[52px] items-center justify-center border border-ink px-9 text-xs font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-ink hover:text-cream"
          >
            Become a Wallmeri artist
          </Link>
        </div>
      </section>
    </div>
  );
}
