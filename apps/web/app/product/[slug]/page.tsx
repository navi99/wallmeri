"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";

import Image from "@/components/app-image";
import { BoxContents } from "@/components/box-contents";
import { InstallGuide } from "@/components/install-guide";
import { ProductGallery } from "@/components/product-gallery";
import { ReviewsSection } from "@/components/reviews-section";
import { SizePicker } from "@/components/custom/size-picker";
import { Stars } from "@/components/stars";
import { Button, Spinner } from "@/components/ui";
import { WhyLoveIt } from "@/components/why-love-it";
import { api, ApiError } from "@/lib/api";
import { useCart } from "@/lib/store/cart";
import { formatINR } from "@/lib/utils";

// Made to order, so nothing caps quantity but us. A per-line ceiling keeps the
// stepper honest; bulk buyers should go through the contact form.
const MAX_QTY = 10;

export default function ProductPage({ params }: { params: { slug: string } }) {
  const [qty, setQty] = useState(1);
  const [sizeCode, setSizeCode] = useState<string | null>(null);
  const add = useCart((s) => s.add);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", params.slug],
    queryFn: () => api.getProduct(params.slug),
    retry: false,
  });

  const sizesQuery = useQuery({ queryKey: ["poster-sizes"], queryFn: () => api.posterSizes() });
  const sizes = sizesQuery.data ?? [];

  const artistSlug = product?.artist?.slug;
  const artistQuery = useQuery({
    queryKey: ["artist", artistSlug],
    queryFn: () => api.getArtist(artistSlug!),
    enabled: !!artistSlug,
  });

  useEffect(() => {
    if (!sizeCode && sizes.length > 0) {
      const a4 = sizes.find((s) => s.code === "A4");
      const cheapest = sizes.reduce((min, s) => (s.delta_inr < min.delta_inr ? s : min));
      setSizeCode((a4 ?? cheapest).code);
    }
  }, [sizes, sizeCode]);

  // Product.price_inr is always quoted for A4; each size's price here is
  // that base plus its delta (0 at A4) — so the SizePicker shows the
  // product's real price at each size, not the shared custom-upload price.
  const basePrice = product?.price_inr ?? 0;
  const displaySizes = sizes.map((s) => ({ ...s, price_inr: basePrice + s.delta_inr }));
  const selectedSize = displaySizes.find((s) => s.code === sizeCode) ?? null;
  // Falls back to the product's flat price if sizes haven't loaded yet, or
  // none are configured — keeps the PDP usable rather than blocking on them.
  const displayPrice = selectedSize ? selectedSize.price_inr : basePrice;

  if (isLoading) {
    return (
      <div className="grid place-items-center py-32">
        <Spinner />
      </div>
    );
  }

  if (error || !product) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl font-bold uppercase tracking-tight text-ink">
          {notFound ? "Poster not found" : "Something went wrong"}
        </h1>
        <Link href="/catalog" className="mt-4 inline-block font-semibold text-brand-600 hover:underline">
          Back to catalog
        </Link>
      </div>
    );
  }

  const sizeRequired = sizes.length > 0;
  const canAdd = !sizeRequired || !!selectedSize;

  const onAdd = () => {
    if (!canAdd) return;
    add(
      {
        kind: "product",
        product_id: product.id,
        slug: product.slug,
        title: product.title,
        image_url: product.image_url,
        price_inr: displayPrice,
        size_code: selectedSize?.code,
        size_label: selectedSize?.label,
      },
      qty,
    );
    toast.success(`Added ${qty} × "${product.title}" to cart`);
  };

  const primaryCategory = product.categories[0] ?? null;

  return (
    <div className="container-page py-8">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
        <Link href="/catalog" className="hover:text-brand-600">
          Shop
        </Link>
        {primaryCategory && (
          <>
            <span aria-hidden>/</span>
            <Link href={`/category/${primaryCategory.slug}`} className="hover:text-brand-600">
              {primaryCategory.name}
            </Link>
          </>
        )}
        <span aria-hidden>/</span>
        <span className="text-ink">{product.title}</span>
      </nav>

      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <ProductGallery images={product.images} fallbackImageUrl={product.image_url} title={product.title} />

        <div>
          {primaryCategory && (
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-600">
              {primaryCategory.name}
            </div>
          )}
          <h1 className="mt-2.5 text-3xl font-bold uppercase leading-[1.1] tracking-tight text-ink sm:text-4xl">
            {product.title}
          </h1>
          <p className="mt-2 font-display text-base italic text-muted">
            {product.artist ? (
              <>
                by{" "}
                <Link href={`/artist/${product.artist.slug}`} className="text-brand-600 hover:text-ink">
                  {product.artist.name}
                </Link>
              </>
            ) : (
              "A Wallmeri Original"
            )}
          </p>
          {product.rating_count > 0 && (
            <Stars
              rating={product.rating_avg ?? 0}
              count={product.rating_count}
              className="mt-2"
            />
          )}

          <p className="mt-4 text-3xl font-bold text-brand-600">{formatINR(displayPrice)}</p>

          <p className="mt-4 whitespace-pre-wrap leading-relaxed text-muted">{product.description}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.08em] text-muted">Material: {product.material}</p>

          {sizeRequired && (
            <div className="mt-6">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-ink">Size</div>
              <div className="mt-3">
                <SizePicker sizes={displaySizes} selected={sizeCode} onSelect={setSizeCode} />
              </div>
            </div>
          )}

          <div className="mt-6 flex items-stretch gap-3.5">
            <div className="flex items-center border border-ink/20">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-[52px] w-11 place-items-center text-ink hover:bg-ink/5"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-semibold">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))}
                className="grid h-[52px] w-11 place-items-center text-ink hover:bg-ink/5"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button size="lg" onClick={onAdd} disabled={!canAdd} className="flex-1">
              Add to cart
            </Button>
          </div>

          {product.original && (
            <div className="mt-4 border border-ink/15 p-4">
              <p className="font-display text-base italic text-ink">
                Also available as an original painting
              </p>
              <p className="mt-1 text-lg font-bold text-brand-600">
                {formatINR(product.original.price_inr)}
              </p>
              {product.original.status === "sold" ? (
                <span className="mt-3 inline-block cursor-not-allowed border border-ink/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
                  Original sold
                </span>
              ) : (
                <>
                  <Link
                    href={`/product/${product.slug}/original`}
                    className="mt-3 inline-block border border-ink px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink hover:bg-ink hover:text-cream"
                  >
                    Buy Original →
                  </Link>
                  {product.original.status === "reserved" && (
                    <p className="mt-2 text-xs text-muted">Reserved — inquiries still open</p>
                  )}
                </>
              )}
            </div>
          )}

          {product.artist && (
            <div className="mt-4 flex items-center gap-3.5 bg-brand-50/60 p-4">
              <div className="relative h-11 w-11 flex-none overflow-hidden rounded-full bg-ink">
                <Image
                  src={product.artist.avatar_url}
                  alt={product.artist.name}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-display text-base italic text-ink">{product.artist.name}</div>
                <div className="text-xs text-muted">
                  {artistQuery.data
                    ? `${artistQuery.data.product_count} work${artistQuery.data.product_count === 1 ? "" : "s"}`
                    : "Wallmeri artist"}
                </div>
              </div>
              <Link
                href={`/artist/${product.artist.slug}`}
                className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-600 hover:text-ink"
              >
                View profile
              </Link>
            </div>
          )}
        </div>
      </div>

      <WhyLoveIt />

      <BoxContents />

      <InstallGuide />

      <ReviewsSection slug={product.slug} />
    </div>
  );
}
