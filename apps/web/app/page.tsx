"use client";

import Link from "next/link";
import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui";
import { api } from "@/lib/api";

const kicker =
  "text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-600";
const sectionHeading =
  "font-sans text-[clamp(26px,2.8vw,34px)] font-bold uppercase tracking-tight text-ink";

// Steel-poster texture for category tiles (from the handoff design).
const stripes =
  "repeating-linear-gradient(45deg, rgba(250,249,246,0.05) 0 2px, transparent 2px 14px)";
const categoryGradients = [
  "linear-gradient(160deg,#810100 0%,#2e0503 100%)",
  "linear-gradient(200deg,#3a3230 0%,#1B1717 100%)",
  "linear-gradient(180deg,#4a4340 0%,#241f1e 100%)",
  "linear-gradient(140deg,#1B1717 0%,#1B1717 60%,#5b0a06 100%)",
];

export default function HomePage() {
  const productsQuery = useQuery({
    queryKey: ["products", { featured: true }],
    queryFn: () => api.listProducts({ page_size: 8, sort: "newest" }),
  });
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.listCategories(),
  });

  const carouselRef = useRef<HTMLDivElement>(null);
  const scrollCarousel = (dir: -1 | 1) => {
    const el = carouselRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const products = productsQuery.data?.items ?? [];
  // Featured first, backfilled with the newest of the rest.
  const gridProducts = [
    ...products.filter((p) => p.is_featured),
    ...products.filter((p) => !p.is_featured),
  ].slice(0, 8);
  const heroProduct = gridProducts[0];
  const qualityProduct = gridProducts[1] ?? heroProduct;
  const categories = categoriesQuery.data ?? [];

  const arrowButton =
    "grid h-11 w-11 place-items-center border border-ink text-ink transition-colors hover:bg-ink hover:text-cream disabled:opacity-40";

  return (
    <div>
      {/* Hero — framed poster flanked by headline and pitch */}
      <section className="container-page flex flex-wrap items-center justify-center gap-[clamp(32px,4vw,56px)] py-[clamp(56px,7vw,96px)]">
        <div className="flex min-w-[280px] max-w-[380px] flex-1 flex-col items-end gap-5 text-right">
          <div className={kicker}>Art on metal</div>
          <h1 className="font-sans text-[clamp(44px,4.5vw,64px)] font-bold uppercase leading-[1.02] tracking-tight text-ink">
            Your walls,
            <br />
            <em className="font-display font-medium normal-case italic tracking-normal">
              elevated.
            </em>
          </h1>
        </div>

        <div className="w-[min(380px,88vw)] flex-none bg-ink p-3.5 shadow-[0_24px_60px_rgba(27,23,23,0.25)]">
          {productsQuery.isLoading ? (
            <div
              className="aspect-[73/100] w-full animate-pulse bg-white/5 motion-reduce:animate-none"
              aria-hidden="true"
            />
          ) : heroProduct ? (
            <Link
              href={`/product/${heroProduct.slug}`}
              className="relative block aspect-[73/100] w-full overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroProduct.image_url}
                alt={heroProduct.title}
                className="h-full w-full object-cover"
              />
            </Link>
          ) : (
            <div className="grid aspect-[73/100] w-full place-items-center p-8 text-center">
              <div>
                <p className="font-display text-2xl italic text-cream">
                  The gallery is being rehung.
                </p>
                <p className="mt-2 text-sm text-cream/60">
                  New pieces are on their way — browse back soon.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex min-w-[280px] max-w-[340px] flex-1 flex-col gap-6">
          <p className="text-[17px] leading-[1.65] text-ink/75">
            Museum-grade prints on solid metal. Magnetic mounting, no frames,
            no drilling — gallery presence in seconds.
          </p>
          <div className="flex flex-wrap gap-3.5">
            <Link href="/catalog">
              <Button size="lg">Shop posters</Button>
            </Link>
            <Link href="/catalog?sort=newest">
              <Button size="lg" variant="outline">
                New arrivals
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Collections */}
      {categories.length > 0 && (
        <section className="container-page pb-[clamp(56px,7vw,96px)]">
          <div className="mb-9 flex flex-wrap items-baseline justify-between gap-4">
            <h2 className={sectionHeading}>Collections</h2>
            <Link
              href="/catalog"
              className="text-xs font-medium uppercase tracking-[0.16em] text-brand-600 hover:text-ink"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-5">
            {categories.map((c, i) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className="group flex flex-col gap-3"
              >
                <div
                  className="flex h-[300px] items-end p-[18px] transition-opacity group-hover:opacity-85"
                  style={{
                    background: `${stripes}, ${categoryGradients[i % categoryGradients.length]}`,
                  }}
                >
                  <span className="font-display text-3xl italic text-cream">
                    {c.name}
                  </span>
                </div>
                <span className="text-[15px] font-semibold uppercase tracking-[0.06em] text-ink group-hover:text-brand-600">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Bestsellers carousel */}
      <section className="pb-[clamp(56px,7vw,96px)]">
        <div className="container-page mb-9 flex flex-wrap items-baseline justify-between gap-4">
          <h2 className={sectionHeading}>Bestsellers</h2>
          <div className="flex gap-2.5">
            <button
              onClick={() => scrollCarousel(-1)}
              aria-label="Scroll bestsellers back"
              className={arrowButton}
            >
              ←
            </button>
            <button
              onClick={() => scrollCarousel(1)}
              aria-label="Scroll bestsellers forward"
              className={arrowButton}
            >
              →
            </button>
          </div>
        </div>

        {productsQuery.isLoading ? (
          <div
            className="container-page flex gap-5 overflow-hidden"
            aria-hidden="true"
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-[3/4] w-[280px] flex-none animate-pulse bg-ink/10 motion-reduce:animate-none"
              />
            ))}
          </div>
        ) : productsQuery.isError ? (
          <div className="container-page">
            <div className="border border-ink/10 bg-paper p-10 text-center">
              <p className="font-display text-2xl italic text-ink">
                We couldn&apos;t load the gallery.
              </p>
              <p className="mt-2 text-sm text-muted">
                Something went wrong on our side — your connection is probably
                fine.
              </p>
              <Button
                variant="outline"
                className="mt-5"
                onClick={() => productsQuery.refetch()}
              >
                Try again
              </Button>
            </div>
          </div>
        ) : gridProducts.length === 0 ? (
          <div className="container-page">
            <div className="border border-ink/10 bg-paper p-10 text-center">
              <p className="font-display text-2xl italic text-ink">
                The gallery is being rehung.
              </p>
              <p className="mt-2 text-sm text-muted">
                New pieces are on their way. Meet the artists behind them in
                the meantime.
              </p>
              <Link href="/artists" className="mt-5 inline-block">
                <Button variant="outline">Meet the artists</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div
            ref={carouselRef}
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 sm:px-6 lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))]"
          >
            {gridProducts.map((p) => (
              <div key={p.id} className="w-[280px] flex-none snap-start">
                <ProductCard product={p} showFeaturedBadge={false} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How it works — magnetic mounting */}
      <section className="bg-ink px-[clamp(24px,5vw,64px)] py-[clamp(56px,7vw,88px)]">
        <div className="mb-16 text-center">
          <div className={`${kicker} mb-4`}>Magnetic mounting</div>
          <h2 className="font-sans text-[clamp(28px,3.4vw,40px)] font-bold uppercase tracking-tight text-cream">
            On your wall in{" "}
            <em className="font-display font-medium normal-case italic tracking-normal">
              under a minute
            </em>
          </h2>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-12">
          {[
            {
              n: "01",
              title: "Stick the magnet",
              body: "One adhesive magnet pad on the wall. No drill, no holes, no damage.",
            },
            {
              n: "02",
              title: "Snap the poster",
              body: "The steel poster clicks onto the magnet — perfectly flat, perfectly level.",
            },
            {
              n: "03",
              title: "Swap anytime",
              body: "Change artwork in seconds. One magnet, an entire rotating gallery.",
            },
          ].map((step) => (
            <div
              key={step.n}
              className="flex flex-col items-center gap-4 text-center"
            >
              <div className="font-display text-[52px] italic leading-none text-cream/30">
                {step.n}
              </div>
              <div className="text-[13px] font-semibold uppercase tracking-[0.16em] text-cream">
                {step.title}
              </div>
              <p className="max-w-[260px] text-sm leading-[1.7] text-cream/60">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Quality — the material */}
      <section className="container-page flex flex-wrap items-center gap-[clamp(40px,5vw,72px)] py-[clamp(56px,7vw,96px)]">
        <div className="h-[460px] min-w-[300px] flex-1 bg-ink">
          {qualityProduct ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qualityProduct.image_url}
              alt={qualityProduct.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="h-full w-full"
              style={{ background: `${stripes}, ${categoryGradients[1]}` }}
              aria-hidden="true"
            />
          )}
        </div>
        <div className="flex min-w-[300px] max-w-[440px] flex-1 flex-col gap-[22px]">
          <div className={kicker}>The material</div>
          <h2 className="font-sans text-[clamp(28px,3.4vw,40px)] font-bold uppercase leading-[1.1] tracking-tight text-ink">
            Solid metal.
            <br />
            <em className="font-display font-medium normal-case italic tracking-normal">
              Built to outlast paper.
            </em>
          </h2>
          <p className="text-[15px] leading-[1.7] text-ink/70">
            Each piece is printed directly onto rigid steel with UV-cured inks
            — colours that never fade, edges that never curl, a matte finish
            that reads like a gallery print.
          </p>
          <div className="flex flex-wrap gap-10 pt-2">
            <div>
              <div className="text-2xl font-bold text-ink">10+ yrs</div>
              <div className="text-[11px] uppercase tracking-[0.1em] text-ink/50">
                Colour guarantee
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-ink">100%</div>
              <div className="text-[11px] uppercase tracking-[0.1em] text-ink/50">
                Recyclable steel
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
