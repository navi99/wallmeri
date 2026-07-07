"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui";
import { api } from "@/lib/api";

export default function HomePage() {
  const productsQuery = useQuery({
    queryKey: ["products", { featured: true }],
    queryFn: () => api.listProducts({ page_size: 8, sort: "newest" }),
  });
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.listCategories(),
  });
  const artistsQuery = useQuery({
    queryKey: ["artists"],
    queryFn: () => api.listArtists(),
  });

  const products = productsQuery.data?.items ?? [];
  const featuredOnly = products.filter((p) => p.is_featured);
  const hasFeatured = featuredOnly.length > 0;
  // Featured first, backfilled with the newest of the rest to a full grid.
  const gridProducts = [
    ...featuredOnly,
    ...products.filter((p) => !p.is_featured),
  ].slice(0, 8);
  const heroTiles = gridProducts.slice(0, 4);

  return (
    <div>
      {/* Hero — noir gallery wall */}
      <section className="relative overflow-hidden bg-ink text-cream">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(65%_90%_at_15%_0%,rgba(99,0,0,0.55),transparent_70%)]" />
        <div className="container-page relative grid items-center gap-10 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <h1 className="font-display text-4xl font-semibold leading-[1.1] sm:text-6xl">
              Art that lasts.{" "}
              <span className="italic text-brand-300">Printed on metal.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-cream/70">
              Bold, durable wall art for your home and workspace. Curated
              designs, vivid colours, and free shipping across India over
              ₹2,999.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/catalog">
                <Button size="lg">Browse the collection</Button>
              </Link>
              <Link href="/catalog?sort=price_asc">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-cream/30 bg-transparent text-cream hover:border-cream/60 hover:bg-white/10"
                >
                  Shop best value
                </Button>
              </Link>
            </div>
          </div>
          {productsQuery.isLoading ? (
            <div className="grid grid-cols-2 gap-4 pb-6" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`aspect-[3/4] animate-pulse rounded-2xl border border-white/10 bg-white/5 motion-reduce:animate-none ${
                    i % 2 === 1 ? "translate-y-6" : ""
                  }`}
                />
              ))}
            </div>
          ) : heroTiles.length === 0 ? (
            <div className="grid min-h-64 place-items-center rounded-2xl border border-white/15 p-10 text-center">
              <div>
                <p className="font-display text-2xl text-cream">
                  The gallery is being rehung.
                </p>
                <p className="mt-2 text-sm text-cream/60">
                  New pieces are on their way — browse back soon.
                </p>
              </div>
            </div>
          ) : heroTiles.length === 1 ? (
            <Link
              href={`/product/${heroTiles[0].slug}`}
              className="relative mx-auto block aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl border border-white/15 shadow-lift transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroTiles[0].image_url}
                alt={heroTiles[0].title}
                className="h-full w-full object-cover"
              />
            </Link>
          ) : heroTiles.length === 3 ? (
            <div className="grid grid-cols-2 gap-4 pb-6">
              <Link
                href={`/product/${heroTiles[0].slug}`}
                className="relative row-span-2 overflow-hidden rounded-2xl border border-white/15 shadow-lift transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroTiles[0].image_url}
                  alt={heroTiles[0].title}
                  className="h-full w-full object-cover"
                />
              </Link>
              {heroTiles.slice(1).map((p) => (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/15 shadow-lift transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image_url}
                    alt={p.title}
                    className="h-full w-full object-cover"
                  />
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 pb-6">
              {heroTiles.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  className={`relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/15 shadow-lift transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
                    i % 2 === 1 ? "translate-y-6" : ""
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image_url}
                    alt={p.title}
                    className="h-full w-full object-cover"
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Reassurance strip */}
      <section className="border-b border-brand-100">
        <p className="container-page flex flex-wrap items-center justify-center gap-x-3 gap-y-1 py-4 text-center text-sm text-muted">
          <span>Free shipping over ₹2,999</span>
          <span aria-hidden="true">·</span>
          <span>Secure Razorpay checkout</span>
          <span aria-hidden="true">·</span>
          <span>Gallery-grade prints on steel</span>
        </p>
      </section>

      {/* Categories */}
      {categoriesQuery.data && categoriesQuery.data.length > 0 && (
        <section className="container-page py-6">
          <h2 className="text-2xl font-bold text-ink">Shop by category</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {categoriesQuery.data.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className="rounded-full border border-brand-200 bg-paper px-5 py-2 text-sm font-medium text-ink hover:border-brand-400 hover:bg-brand-50"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Meet the artists */}
      {artistsQuery.data && artistsQuery.data.length > 0 && (
        <section className="container-page py-6">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold text-ink">Meet the artists</h2>
            <Link href="/artists" className="text-sm font-semibold text-brand-700 hover:underline">
              All artists →
            </Link>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {artistsQuery.data.slice(0, 3).map((a) => (
              <Link
                key={a.id}
                href={`/artist/${a.slug}`}
                className="flex items-center gap-4 rounded-2xl border border-brand-100 bg-paper p-5 shadow-card transition-shadow hover:shadow-lift"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-brand-50">
                  {a.avatar_url && (
                    <Image src={a.avatar_url} alt={a.name} fill sizes="56px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-ink">{a.name}</p>
                  <p className="line-clamp-1 text-sm text-muted">{a.bio}</p>
                  <p className="mt-0.5 text-xs font-semibold text-brand-700">
                    {a.product_count} poster{a.product_count === 1 ? "" : "s"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      <section className="container-page py-10">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold text-ink">
            {hasFeatured ? "Featured posters" : "New arrivals"}
          </h2>
          <Link href="/catalog" className="text-sm font-semibold text-brand-700 hover:underline">
            View all →
          </Link>
        </div>
        {productsQuery.isLoading ? (
          <div
            className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
            aria-hidden="true"
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-2xl border border-brand-100 bg-paper motion-reduce:animate-none"
              >
                <div className="aspect-[3/4] bg-brand-50" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-3/4 rounded bg-brand-100" />
                  <div className="h-3 w-1/2 rounded bg-brand-50" />
                </div>
              </div>
            ))}
          </div>
        ) : productsQuery.isError ? (
          <div className="mt-6 rounded-2xl border border-brand-100 bg-paper p-10 text-center">
            <p className="font-display text-xl text-ink">
              We couldn&apos;t load the gallery.
            </p>
            <p className="mt-2 text-sm text-muted">
              Something went wrong on our side — your connection is probably fine.
            </p>
            <Button
              variant="outline"
              className="mt-5"
              onClick={() => productsQuery.refetch()}
            >
              Try again
            </Button>
          </div>
        ) : gridProducts.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-brand-100 bg-paper p-10 text-center">
            <p className="font-display text-xl text-ink">
              The gallery is being rehung.
            </p>
            <p className="mt-2 text-sm text-muted">
              New pieces are on their way. Meet the artists behind them in the
              meantime.
            </p>
            <Link href="/artists" className="mt-5 inline-block">
              <Button variant="outline">Meet the artists</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {gridProducts.map((p) => (
              <ProductCard key={p.id} product={p} showFeaturedBadge={false} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
