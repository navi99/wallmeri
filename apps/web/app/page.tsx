"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, Sparkles, Truck } from "lucide-react";

import { ProductCard } from "@/components/product-card";
import { Button, Spinner } from "@/components/ui";
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

  const featured =
    productsQuery.data?.items.filter((p) => p.is_featured).slice(0, 8) ??
    productsQuery.data?.items.slice(0, 8) ??
    [];

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-brand-100 bg-gradient-to-b from-brand-50 to-cream">
        <div className="container-page grid items-center gap-8 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm font-semibold text-brand-700 shadow-sm">
              <Sparkles className="h-4 w-4" /> Premium metal posters
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
              Art that lasts.{" "}
              <span className="text-brand-600">Printed on metal.</span>
            </h1>
            <p className="mt-4 max-w-md text-lg text-muted">
              Bold, durable wall art for your home and workspace. Curated
              designs, vivid colours, and free shipping across India over
              ₹2,999.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/catalog">
                <Button size="lg">Browse the collection</Button>
              </Link>
              <Link href="/catalog?sort=price_asc">
                <Button size="lg" variant="outline">
                  Shop best value
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {featured.slice(0, 4).map((p, i) => (
              <Link
                key={p.id}
                href={`/product/${p.slug}`}
                className={`relative overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-card ${
                  i % 3 === 0 ? "aspect-[3/4]" : "aspect-[3/4]"
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
            {featured.length === 0 && (
              <div className="col-span-2 grid h-64 place-items-center rounded-2xl border border-brand-100 bg-white">
                <Spinner />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="container-page grid gap-4 py-10 sm:grid-cols-3">
        {[
          { icon: Truck, title: "Free shipping over ₹2,999", desc: "Fast, tracked delivery across India." },
          { icon: ShieldCheck, title: "Secure payments", desc: "Razorpay checkout — UPI, cards & more." },
          { icon: Sparkles, title: "Gallery-grade prints", desc: "Vivid, fade-resistant metal posters." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3 rounded-2xl border border-brand-100 bg-white p-5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-ink">{title}</p>
              <p className="text-sm text-muted">{desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Categories */}
      {categoriesQuery.data && categoriesQuery.data.length > 0 && (
        <section className="container-page py-6">
          <h2 className="text-2xl font-bold text-ink">Shop by category</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {categoriesQuery.data.map((c) => (
              <Link
                key={c.id}
                href={`/catalog?category=${c.slug}`}
                className="rounded-full border border-brand-200 bg-white px-5 py-2 text-sm font-medium text-ink hover:border-brand-400 hover:bg-brand-50"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      <section className="container-page py-10">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold text-ink">Featured posters</h2>
          <Link href="/catalog" className="text-sm font-semibold text-brand-700 hover:underline">
            View all →
          </Link>
        </div>
        {productsQuery.isLoading ? (
          <div className="grid place-items-center py-16">
            <Spinner />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
