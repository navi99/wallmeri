import type { Metadata } from "next";
import Image from "@/components/app-image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | Wallmeri",
  description:
    "Wallmeri brings original Indian artwork from talented independent artists to your walls as premium metal posters — professionally printed in India, with every purchase directly supporting the artist behind it.",
};

const kicker =
  "text-[11px] font-semibold uppercase tracking-[0.28em] text-premium-600";
const kickerOnDark =
  "text-[11px] font-semibold uppercase tracking-[0.28em] text-premium-100";
const sectionHeading =
  "font-sans text-[28px] sm:text-[36px] lg:text-[42px] font-bold uppercase leading-tight tracking-tight text-ink";
const accent =
  "font-display font-medium normal-case italic tracking-normal";
const accentRed = `${accent} text-premium-600`;
const narrativeHeading =
  "font-display text-[34px] sm:text-[44px] lg:text-[56px] font-medium italic leading-[1.08] text-cream";
const buttonBase =
  "inline-flex h-[52px] items-center justify-center px-9 text-xs font-semibold uppercase tracking-[0.16em]";

const beliefs = [
  {
    n: "01",
    title: "Fair to artists",
    body: "Artists remain at the heart of everything we do. Every artwork is licensed with permission, every artist receives credit, and every sale earns them a fair share.",
  },
  {
    n: "02",
    title: "Quality without compromise",
    body: "From premium aluminium and vibrant sublimation printing to secure packaging and magnetic mounting, every detail is chosen to create artwork that lasts.",
  },
  {
    n: "03",
    title: "Curated, not crowded",
    body: "We don't aim to have the biggest catalogue. We carefully select every collection so customers can discover artwork with originality, character and lasting appeal.",
  },
];

const steps = [
  {
    n: "01",
    title: "We curate",
    body: "We discover talented independent Indian artists and carefully select original artwork for our collections.",
  },
  {
    n: "02",
    title: "Artists earn",
    body: "Artists license their work to Wallmeri through a simple, transparent agreement and receive a share from every sale.",
  },
  {
    n: "03",
    title: "We print",
    body: "Each artwork is made to order using sublimation printing on premium aluminium, delivering sharp colours and exceptional durability.",
  },
  {
    n: "04",
    title: "You display",
    body: "Your artwork arrives ready to mount with our magnetic system — no drilling, no damage, just beautiful art on your wall.",
  },
];

const materials = [
  {
    n: "01",
    title: "Premium Aluminium",
    body: "Rigid, lightweight and modern with a clean matte finish.",
  },
  {
    n: "02",
    title: "Sublimation Printing",
    body: "Colours are permanently fused into the metal surface for exceptional sharpness and durability.",
  },
  {
    n: "03",
    title: "Magnetic Mounting",
    body: "Install in minutes without drilling, and easily swap artwork whenever you want a fresh look.",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* 1 · Hero — story left, one framed piece right. Cotton canvas; red is saved for the bands below */}
      <section className="px-[clamp(24px,5vw,64px)] py-[clamp(56px,7vw,104px)]">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-[clamp(40px,6vw,96px)] gap-y-12">
          <div className="flex min-w-[300px] max-w-[560px] flex-1 flex-col items-start gap-6">
            <div className={kicker}>About Wallmeri</div>
            <h1 className="font-sans text-[40px] sm:text-[56px] lg:text-[64px] font-bold uppercase leading-[68px] tracking-tight text-ink">
              Art deserves more than <em className={accentRed}>a scroll.</em>
            </h1>
            <p className="max-w-[480px] text-[17px] leading-[1.65] text-muted">
              Wallmeri brings original Indian artwork from talented
              independent artists to your walls as premium metal posters.
              Every piece is carefully curated, professionally printed in
              India, and every purchase directly supports the artist behind
              it.
            </p>
            <div className="flex flex-wrap gap-3.5 pt-1">
              <Link
                href="/catalog"
                className={`${buttonBase} bg-ink text-cream transition-colors hover:bg-premium-600 active:bg-premium-700`}
              >
                Explore the Art
              </Link>
              <Link
                href="/artists/join"
                className={`${buttonBase} border border-ink text-ink transition-colors hover:bg-ink hover:text-cream`}
              >
                Join as an Artist
              </Link>
            </div>
          </div>

          {/* The one framed piece in the gallery: Noir frame, static hero shot */}
          <div className="mx-auto w-full min-w-[300px] max-w-[460px] flex-1">
            <div className="h-[500px] bg-ink p-3.5 shadow-card">
              <div className="relative h-full w-full">
                <Image
                  src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=920&q=80"
                  alt="A single framed metal print anchoring a warm, modern living room"
                  fill
                  priority
                  sizes="(max-width: 640px) 90vw, 460px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2 · The story — the problem, then the answer, told once. Noir drench, centered */}
      <section className="bg-ink px-[clamp(24px,5vw,64px)] py-[clamp(64px,8vw,112px)]">
        <div className="mx-auto flex max-w-[820px] flex-col items-center gap-7 text-center">
          <div className={kickerOnDark}>Our Story</div>
          <h2 className={narrativeHeading}>
            Great art deserves
            <br />a longer life.
          </h2>
          <p className="max-w-[640px] text-[17px] leading-[1.75] text-cream/70">
            Every day, thousands of talented Indian artists share incredible
            work online — seen for a few seconds, appreciated with a like,
            and lost in an endless feed. Wallmeri was created to help
            meaningful artwork leave the screen and become part of everyday
            spaces. We work directly with artists, transform their creations
            into premium metal prints, and deliver them to homes across
            India.
          </p>
        </div>
      </section>

      {/* 3 · What we believe — the three pillars, columned so it reads distinct from the numbered list below */}
      <section className="px-[clamp(24px,5vw,64px)] py-[clamp(56px,7vw,96px)]">
        <div className="mx-auto max-w-[1040px]">
          <div className="mb-14 text-center">
            <div className={`${kicker} mb-4`}>What We Believe</div>
            <h2 className={sectionHeading}>
              Built around artists. <em className={accentRed}>Designed for art lovers.</em>
            </h2>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-x-12 gap-y-12">
            {beliefs.map((b) => (
              <div key={b.n} className="flex flex-col gap-4">
                <div className="font-display text-[44px] italic leading-none text-premium-600">
                  {b.n}
                </div>
                <div className="text-[15px] font-semibold uppercase tracking-[0.06em] text-ink">
                  {b.title}
                </div>
                <p className="text-[15px] leading-[1.7] text-muted">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 · How it works — discover, earn, print, hang: a single centered list */}
      <section className="px-[clamp(24px,5vw,64px)] py-[clamp(56px,7vw,96px)]">
        <div className="mb-14 text-center">
          <div className={`${kicker} mb-4`}>How Wallmeri Works</div>
          <h2 className={sectionHeading}>
            From an artist&apos;s portfolio{" "}
            <em className={accentRed}>to your wall.</em>
          </h2>
        </div>
        <div className="mx-auto flex max-w-[820px] flex-col">
          {steps.map((step) => (
            <div
              key={step.n}
              className="grid grid-cols-[64px_1fr] items-baseline gap-x-[clamp(20px,3vw,40px)] border-t border-ink/15 py-[clamp(24px,3vw,32px)]"
            >
              <span className="font-display text-[40px] italic leading-none text-premium-600">
                {step.n}
              </span>
              <div className="flex flex-col gap-2">
                <div className="text-[15px] font-semibold uppercase tracking-[0.08em] text-ink">
                  {step.title}
                </div>
                <p className="text-[15px] leading-[1.7] text-muted">{step.body}</p>
              </div>
            </div>
          ))}
          <div className="border-t border-ink/15" />
        </div>
      </section>

      {/* 5 · Why metal — the material story, Noir drench so it reads as a deliberate second dark band, not a repeat of How It Works */}
      <section className="bg-ink px-[clamp(24px,5vw,64px)] py-[clamp(64px,8vw,104px)]">
        <div className="mx-auto max-w-[1040px]">
          <div className="mx-auto mb-14 max-w-[640px] text-center">
            <div className={`${kickerOnDark} mb-4`}>The Material</div>
            <h2 className={narrativeHeading}>Built to last.</h2>
            <p className="mt-5 text-[17px] leading-[1.75] text-cream/70">
              Instead of paper or canvas, every Wallmeri artwork is produced
              on premium aluminium.
            </p>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-x-10 gap-y-12">
            {materials.map((m) => (
              <div key={m.n} className="flex flex-col gap-4">
                <div className="font-display text-[40px] italic leading-none text-premium-100">
                  {m.n}
                </div>
                <div className="text-[15px] font-semibold uppercase tracking-[0.06em] text-cream">
                  {m.title}
                </div>
                <p className="text-[15px] leading-[1.7] text-cream/70">{m.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6 · Our vision — plain centered text, no drench, so the two dark bands either side of it stay the exception */}
      <section className="px-[clamp(24px,5vw,64px)] py-[clamp(56px,7vw,96px)]">
        <div className="mx-auto flex max-w-[720px] flex-col items-center gap-6 text-center">
          <div className={kicker}>Our Vision</div>
          <h2 className={sectionHeading}>
            Building India&apos;s home{" "}
            <em className={accentRed}>for independent artists.</em>
          </h2>
          <p className="max-w-[620px] text-[17px] leading-[1.75] text-muted">
            We&apos;re creating a platform where talented artists receive the
            recognition, attribution and income they deserve, while helping
            customers discover artwork with genuine stories behind it.
          </p>
          <p className="max-w-[620px] text-[17px] leading-[1.75] text-muted">
            Today, we focus on curated premium metal posters. Tomorrow,
            we&apos;ll grow alongside the artists we work with, introducing
            new collections, new formats and more ways to bring Indian
            creativity into everyday spaces.
          </p>
        </div>
      </section>

      {/* 7 · Closing — Made in India + Join the Journey, Premium Red drench mirroring the hero band elsewhere on the site */}
      <section className="bg-premium-600 px-[clamp(24px,5vw,64px)] py-[clamp(64px,8vw,112px)] text-center">
        <div className="mx-auto flex max-w-[760px] flex-col items-center gap-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cream/75">
            Made in India
          </div>
          <h2 className={narrativeHeading}>
            Proudly made in India.
            <br />
            Built in Bengaluru.
          </h2>
          <p className="max-w-[560px] text-base leading-[1.75] text-cream/80">
            Every Wallmeri piece is made to order in India, supporting local
            artists while maintaining complete control over quality from
            production to delivery. Whether you&apos;re discovering your next
            favourite artwork or sharing your creativity with the world,
            you&apos;re helping build a stronger future for independent
            Indian artists.
          </p>
          <div className="flex flex-wrap justify-center gap-3.5 pt-2">
            <Link
              href="/catalog"
              className={`${buttonBase} bg-cream text-premium-600 transition-colors hover:bg-ink hover:text-cream`}
            >
              Browse the Gallery
            </Link>
            <Link
              href="/artists/join"
              className={`${buttonBase} border border-cream/55 text-cream transition-colors hover:border-cream hover:bg-cream hover:text-premium-600`}
            >
              Become a Wallmeri Artist
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
