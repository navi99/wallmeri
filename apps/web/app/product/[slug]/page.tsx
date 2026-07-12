"use client";

import Image from "@/components/app-image";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronLeft, Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import { toast } from "sonner";

import { ReviewsSection } from "@/components/reviews-section";
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
  const add = useCart((s) => s.add);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", params.slug],
    queryFn: () => api.getProduct(params.slug),
    retry: false,
  });

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

  const onAdd = () => {
    add(
      {
        product_id: product.id,
        slug: product.slug,
        title: product.title,
        image_url: product.image_url,
        price_inr: product.price_inr,
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
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-brand-100 bg-brand-50">
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>

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
          <p className="mt-3 text-3xl font-bold text-brand-600">
            {formatINR(product.price_inr)}
          </p>

          <p className="mt-5 leading-relaxed text-muted">{product.description}</p>

          <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-brand-100 bg-paper px-4 py-3">
              <dt className="text-muted">Material</dt>
              <dd className="font-semibold text-ink">{product.material}</dd>
            </div>
          </dl>

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
            <Button size="lg" onClick={onAdd} className="flex-1 sm:flex-none">
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

      <ReviewsSection slug={product.slug} />
    </div>
  );
}
