"use client";

import Image from "@/components/app-image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";

import { CraftedToLast } from "@/components/crafted-to-last";
import { Badge, Button, Spinner } from "@/components/ui";
import { ApiError } from "@/lib/api";
import { lineId, useCart } from "@/lib/store/cart";
import { useCartQuote } from "@/lib/use-cart-quote";
import { formatINR } from "@/lib/utils";

// Admin-authored size labels often carry a "cm" unit (e.g. "A3 (30 x 40 cm)") -
// shrink just that unit to match the smaller "cm" treatment used in the size
// picker, rather than letting it read at full label size. The unit may be
// followed by trailing punctuation (a closing paren), so match "cm" itself
// rather than requiring it to end the string.
function renderSizeLabel(label: string) {
  const match = label.match(/^(.*?)(cm)(\W*)$/i);
  if (!match) return label;
  return (
    <>
      {match[1]}
      <span className="text-[9px]">{match[2]}</span>
      {match[3]}
    </>
  );
}

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  useEffect(() => setMounted(true), []);

  // Authoritative prices. The locally-stored figures are only a placeholder
  // while this resolves - see useCartQuote.
  const quoteQuery = useCartQuote();
  const quote = quoteQuery.data;
  const quoteError =
    quoteQuery.error instanceof ApiError ? quoteQuery.error.message : null;

  // Per-line server prices, keyed the same way the cart keys its own lines.
  const serverLine = new Map(
    (quote?.lines ?? []).map((l) => [
      l.kind === "custom"
        ? `custom:${l.custom_upload_id}`
        : `product:${l.product_id}:${l.size_code ?? ""}`,
      l,
    ]),
  );

  const localSubtotal = items.reduce((n, i) => n + i.price_inr * i.qty, 0);
  const subtotal = quote?.subtotal_inr ?? localSubtotal;
  const total = quote?.total_inr ?? localSubtotal;
  const savings = quote ? quote.discount_amount_inr : 0;
  const itemCount = items.reduce((n, i) => n + i.qty, 0);
  const hasCustom = items.some((i) => i.kind === "custom");

  if (!mounted) {
    return <div className="container-page py-24" />;
  }

  if (items.length === 0) {
    return (
      <div className="container-page flex flex-col items-center gap-5 py-24 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full border border-line text-brand-600">
          <ShoppingBag className="h-6 w-6" />
        </span>
        <h1 className="font-display text-[22px] italic text-ink">Your cart is empty.</h1>
        <p className="max-w-[340px] text-sm leading-relaxed text-muted">
          Fill it with something worth looking at, every day.
        </p>
        <Link href="/catalog" className="mt-1 inline-block">
          <Button size="lg">Shop the Gallery</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <div className="flex items-baseline justify-between gap-3 pb-8">
        <h1 className="title-xl">
          Your Cart
        </h1>
        <span className="text-sm text-muted">{itemCount} item(s)</span>
      </div>

      <div className="flex flex-col gap-14 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-[1.7] flex-col">
          {items.map((item) => {
            const id = lineId(item);
            const thumb = (
              <div className="h-[150px] w-28 shrink-0 bg-ink p-[2px] shadow-card">
                <div className="relative h-full w-full">
                  <Image src={item.image_url} alt={item.title} fill className="object-cover" sizes="112px" />
                </div>
              </div>
            );
            return (
              <div key={id} className="flex gap-6 border-t border-line py-7">
                {item.kind === "product" ? (
                  <Link href={`/product/${item.slug}`} className="shrink-0">
                    {thumb}
                  </Link>
                ) : (
                  thumb
                )}
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-4">
                    {item.kind === "product" ? (
                      <Link href={`/product/${item.slug}`} className="text-base text-ink hover:text-brand-600">
                        {item.title}
                      </Link>
                    ) : (
                      <span className="text-base text-ink">{item.title}</span>
                    )}
                    <span className="shrink-0 whitespace-nowrap text-[17px] font-semibold text-ink">
                      {formatINR(serverLine.get(id)?.line_total_inr ?? item.price_inr * item.qty)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 label text-xs text-muted">
                    {item.size_label && (
                      <span className="normal-case">Size: {renderSizeLabel(item.size_label)}</span>
                    )}
                    {item.kind === "custom" && <Badge tone="neutral">Custom design</Badge>}
                    {item.dpi_band === "warning" && (
                      <Badge tone="attention">May look soft when printed</Badge>
                    )}
                  </div>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-3">
                    <div className="flex items-center border border-line">
                      <button
                        onClick={() => setQty(id, item.qty - 1)}
                        className="grid h-8 w-8 place-items-center text-ink hover:bg-paper"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-9 text-center text-[13px] font-medium text-ink">{item.qty}</span>
                      <button
                        onClick={() => setQty(id, item.qty + 1)}
                        className="grid h-8 w-8 place-items-center text-ink hover:bg-paper"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => remove(id)}
                      className="label text-xs text-muted hover:text-brand-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="border-t border-line pt-6">
            <Link
              href="/catalog"
              className="label inline-flex items-center gap-2 text-xs text-brand-600 hover:text-brand-700"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>

        <aside className="sticky top-24 w-full border border-line bg-paper p-8 lg:max-w-[400px] lg:flex-1">
          <div className="border-b border-line pb-4 label text-ink">
            Order Summary
          </div>
          <dl className="flex flex-col gap-3 py-5 text-sm text-muted">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd className="text-ink">
                {formatINR(quote ? quote.original_subtotal_inr : subtotal)}
              </dd>
            </div>
            {/* The one savings line the cart is allowed - quiet, no badge. */}
            {savings > 0 && (
              <div className="flex justify-between">
                <dt>
                  {quote?.discount_label ? `${quote.discount_label} - ` : ""}
                  {quote?.discount_percent}% off
                </dt>
                <dd>-{formatINR(savings)}</dd>
              </div>
            )}
          </dl>
          <p className="mb-5 text-xs leading-relaxed text-muted">
            Estimated delivery: 7–20 days from order confirmation. Every Wallmeri metal poster
            is made to order and carefully prepared before dispatch.
          </p>
          {hasCustom && (
            <p className="mb-5 bg-brand-600/[0.06] px-3.5 py-2.5 text-xs leading-relaxed text-brand-600">
              Custom designs are reviewed before printing - usually within 1–2 business days.
            </p>
          )}
          {quoteError && (
            <p className="mb-5 bg-brand-600/[0.06] px-3.5 py-2.5 text-xs leading-relaxed text-brand-600">
              {quoteError} Please review your cart before checking out.
            </p>
          )}
          <div className="flex items-baseline justify-between border-t border-line pt-4">
            <span className="label text-ink">Total</span>
            <span className="text-[28px] font-normal tracking-[0.03em] text-ink">
              {quoteQuery.isLoading ? <Spinner /> : formatINR(total)}
            </span>
          </div>
          {quoteError ? (
            <span className="label mt-4 flex h-14 w-full cursor-not-allowed items-center justify-center border border-line text-muted">
              Checkout unavailable
            </span>
          ) : (
            <Link href="/checkout" className="mt-4 block">
              <span className="label flex h-14 w-full items-center justify-center bg-brand-600 text-cream hover:bg-brand-700">
                Proceed to Checkout
              </span>
            </Link>
          )}
          <div className="mt-4 flex flex-col gap-2.5 border-t border-line pt-4 text-xs leading-relaxed text-muted">
            <div className="flex items-center gap-2.5">
              <span className="text-brand-600">●</span>Secured by Razorpay - UPI, cards, netbanking &amp; wallets
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-brand-600">●</span>Made &amp; shipped from India
            </div>
          </div>
        </aside>
      </div>

      <CraftedToLast />
    </div>
  );
}
