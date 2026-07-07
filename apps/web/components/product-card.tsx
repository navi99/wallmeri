"use client";

import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

import { Stars } from "@/components/stars";
import { Button } from "@/components/ui";
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
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-brand-100 bg-paper shadow-card transition-shadow hover:shadow-lift">
      <Link href={`/product/${product.slug}`} className="relative block aspect-[3/4] overflow-hidden bg-brand-50">
        <Image
          src={product.image_url}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {showFeaturedBadge && product.is_featured && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-600 px-2.5 py-1 text-xs font-bold text-cream">
            Featured
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/product/${product.slug}`}>
          <h3 className="line-clamp-1 font-semibold text-ink hover:text-brand-700">
            {product.title}
          </h3>
        </Link>
        <p className="mt-0.5 line-clamp-1 text-sm text-muted">
          {product.artist ? `by ${product.artist.name}` : (product.categories[0]?.name ?? "Metal Art")}
        </p>
        {product.rating_count > 0 && (
          <Stars rating={product.rating_avg ?? 0} count={product.rating_count} className="mt-1" />
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-ink">
            {formatINR(product.price_inr)}
          </span>
          <Button size="sm" variant="outline" onClick={onAdd}>
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
