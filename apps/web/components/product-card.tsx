"use client";

import Image from "@/components/app-image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { Stars } from "@/components/stars";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";
import { formatINR } from "@/lib/utils";

export function ProductCard({
  product,
  showFeaturedBadge = true,
  imageSizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
}: {
  product: Product;
  showFeaturedBadge?: boolean;
  /** Override when the grid isn't the default 2/3/4-up - e.g. the 3-up listing pages. */
  imageSizes?: string;
}) {
  // Shares the ["poster-sizes"] cache with the product page - one network
  // request no matter how many cards are on screen. product.price_inr is
  // always quoted for A4, so the cheapest enabled size's delta gives this
  // product's true "starting from" price.
  const { data: sizes } = useQuery({ queryKey: ["poster-sizes"], queryFn: () => api.posterSizes() });
  const minDelta = sizes?.length ? Math.min(...sizes.map((s) => s.delta_inr)) : null;
  const displayPrice = minDelta !== null ? product.price_inr + minDelta : product.price_inr;

  return (
    <div className="group flex flex-col gap-3.5">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-[3/4] overflow-hidden bg-ink transition-transform duration-300 group-hover:-translate-y-1.5 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
      >
        <Image
          src={product.image_url}
          alt={product.title}
          fill
          sizes={imageSizes}
          className="object-cover"
        />
        {showFeaturedBadge && product.is_featured && (
          <span className="absolute left-3 top-3 bg-brand-600 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-cream">
            Featured
          </span>
        )}
      </Link>
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between gap-2.5">
          <Link href={`/product/${product.slug}`} className="min-w-0">
            <h3 className="line-clamp-1 text-base font-normal tracking-[0.03em] text-ink hover:text-brand-600">
              {product.title}
            </h3>
          </Link>
          <span className="shrink-0 text-sm font-normal text-brand-600">
            {minDelta !== null && <span className="text-muted">From </span>}
            {formatINR(displayPrice)}
          </span>
        </div>
        <p className="line-clamp-1 text-sm text-muted">
          {product.artist
            ? `by ${product.artist.name}`
            : (product.categories[0]?.name ?? "Metal Art")}
        </p>
        {product.rating_count > 0 && (
          <Stars
            rating={product.rating_avg ?? 0}
            count={product.rating_count}
            className="mt-0.5"
          />
        )}
      </div>
    </div>
  );
}
