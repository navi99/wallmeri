"use client";

import Image from "@/components/app-image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { SpotlightCard } from "@/components/custom/spotlight-card";
import { Stars } from "@/components/stars";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/utils";

export function FeaturedProducts() {
  // Shares the ["products", ...] cache shape with the catalog page.
  const { data, isLoading } = useQuery({
    queryKey: ["products", { featured: "true", page_size: 4 }],
    queryFn: () => api.listProducts({ featured: "true", sort: "newest", page: 1, page_size: 4 }),
  });

  const products = data?.items ?? [];

  if (!isLoading && products.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
      {isLoading
        ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse bg-ink/5" />
          ))
        : products.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.slug}`}
              className="group flex flex-col gap-3"
            >
              <SpotlightCard className="aspect-[3/4] bg-ink shadow-card transition-shadow duration-300 group-hover:shadow-lift">
                <Image
                  src={p.image_url}
                  alt={p.title}
                  fill
                  sizes="(max-width: 640px) 45vw, 22vw"
                  className="object-cover transition-transform duration-300 group-hover:-translate-y-1.5 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
                />
              </SpotlightCard>
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-2.5">
                  <h3 className="line-clamp-1 text-[15px] font-medium tracking-[0.04em] text-ink">
                    {p.title}
                  </h3>
                  <span className="shrink-0 text-sm font-medium text-premium-600">
                    {formatINR(p.price_inr)}
                  </span>
                </div>
                <p className="line-clamp-1 text-xs text-ink/50">
                  {p.artist ? `by ${p.artist.name}` : (p.categories[0]?.name ?? "Metal Art")}
                </p>
                {p.rating_count > 0 && (
                  <Stars rating={p.rating_avg ?? 0} count={p.rating_count} className="mt-0.5" />
                )}
              </div>
            </Link>
          ))}
    </div>
  );
}
