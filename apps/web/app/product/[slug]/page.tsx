"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronLeft, Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import { toast } from "sonner";

import { InstallGuide } from "@/components/install-guide";
import { ProductGallery } from "@/components/product-gallery";
import { ReviewsSection } from "@/components/reviews-section";
import { SizePicker } from "@/components/custom/size-picker";
import { Stars } from "@/components/stars";
import { Badge, Button, Spinner } from "@/components/ui";
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

  return (
    <div className="container-page py-8">
      <Link
        href="/catalog"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-brand-600"
      >
        <ChevronLeft className="h-4 w-4" /> Back to catalog
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <ProductGallery images={product.images} fallbackImageUrl={product.image_url} title={product.title} />

        <div>
          {product.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.categories.map((c) => (
                <Link key={c.id} href={`/category/${c.slug}`}>
                  <Badge className="hover:bg-brand-100">{c.name}</Badge>
                </Link>
              ))}
            </div>
          )}
          <h1 className="mt-3 text-3xl font-bold text-ink">{product.title}</h1>
          <p className="mt-1 text-sm text-muted">
            {product.artist ? (
              <>
                Art by{" "}
                <Link
                  href={`/artist/${product.artist.slug}`}
                  className="font-semibold text-brand-600 hover:underline"
                >
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
          <p className="mt-3 text-3xl font-bold text-brand-600">{formatINR(displayPrice)}</p>

          <p className="mt-5 leading-relaxed text-muted">{product.description}</p>

          <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-brand-100 bg-paper px-4 py-3">
              <dt className="text-muted">Material</dt>
              <dd className="font-semibold text-ink">{product.material}</dd>
            </div>
          </dl>

          {sizeRequired && (
            <div className="mt-6">
              <div className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">Size</div>
              <div className="mt-2">
                <SizePicker sizes={displaySizes} selected={sizeCode} onSelect={setSizeCode} />
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-xl border border-brand-200">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-11 w-11 place-items-center text-ink hover:bg-brand-50"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-semibold">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))}
                className="grid h-11 w-11 place-items-center text-ink hover:bg-brand-50"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button size="lg" onClick={onAdd} disabled={!canAdd} className="flex-1 sm:flex-none">
              Add to cart
            </Button>
          </div>

          <ul className="mt-7 space-y-2 text-sm text-muted">
            <li className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-brand-600" /> Free shipping over ₹2,999
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-600" /> Secure Razorpay checkout
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-brand-600" /> Fade-resistant metal print
            </li>
          </ul>
        </div>
      </div>

      <InstallGuide />

      <ReviewsSection slug={product.slug} />
    </div>
  );
}
