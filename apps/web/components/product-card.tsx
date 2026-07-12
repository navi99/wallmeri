"use client";

import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

import { Stars } from "@/components/stars";
import { useCart } from "@/lib/store/cart";
import type { Product } from "@/lib/types";
import { formatINR } from "@/lib/utils";

export function ProductCard({
  product,
  showFeaturedBadge = true,
}: {
  product: Product;
  showFeaturedBadge?: boolean;
}) {
  const add = useCart((s) => s.add);

  const onAdd = () => {
    add({
      product_id: product.id,
      slug: product.slug,
      title: product.title,
      image_url: product.image_url,
      price_inr: product.price_inr,
    });
    toast.success(`Added "${product.title}" to cart`);
  };

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
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover"
        />
        {showFeaturedBadge && product.is_featured && (
          <span className="absolute left-3 top-3 bg-brand-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-cream">
            Featured
          </span>
        )}
      </Link>
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between gap-2.5">
          <Link href={`/product/${product.slug}`} className="min-w-0">
            <h3 className="line-clamp-1 text-[15px] font-medium tracking-[0.04em] text-ink hover:text-brand-600">
              {product.title}
            </h3>
          </Link>
          <span className="shrink-0 text-sm font-medium text-brand-600">
            {formatINR(product.price_inr)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2.5">
          <p className="line-clamp-1 text-xs text-ink/50">
            {product.artist
              ? `by ${product.artist.name}`
              : (product.categories[0]?.name ?? "Metal Art")}
          </p>
          <button
            onClick={onAdd}
            className="shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-ink underline-offset-4 hover:text-brand-600 hover:underline"
          >
            Add to cart
          </button>
        </div>
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
