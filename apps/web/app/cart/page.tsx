"use client";

import Image from "@/components/app-image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";

import { Badge, Button } from "@/components/ui";
import { lineId, useCart } from "@/lib/store/cart";
import { formatINR } from "@/lib/utils";

const FLAT_SHIPPING = 99;

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  useEffect(() => setMounted(true), []);

  const subtotal = items.reduce((n, i) => n + i.price_inr * i.qty, 0);
  const shipping = subtotal === 0 ? 0 : FLAT_SHIPPING;
  const total = subtotal + shipping;
  const itemCount = items.reduce((n, i) => n + i.qty, 0);
  const hasCustom = items.some((i) => i.kind === "custom");

  if (!mounted) {
    return <div className="container-page py-24" />;
  }

  if (items.length === 0) {
    return (
      <div className="container-page flex flex-col items-center gap-5 py-24 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full border border-ink/15 text-brand-600">
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
        <h1 className="text-3xl font-bold uppercase tracking-tight text-ink lg:text-[38px]">
          Your Cart
        </h1>
        <span className="text-sm text-muted">{itemCount} item(s)</span>
      </div>

      <div className="flex flex-col gap-14 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-[1.7] flex-col">
          {items.map((item) => {
            const id = lineId(item);
            const thumb = (
              <div className="h-[150px] w-28 shrink-0 bg-ink p-2">
                <div className="relative h-full w-full">
                  <Image src={item.image_url} alt={item.title} fill className="object-cover" sizes="112px" />
                </div>
              </div>
            );
            return (
              <div key={id} className="flex gap-6 border-t border-ink/10 py-7">
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
                      <Link href={`/product/${item.slug}`} className="font-display text-[19px] text-ink hover:text-brand-600">
                        {item.title}
                      </Link>
                    ) : (
                      <span className="font-display text-[19px] text-ink">{item.title}</span>
                    )}
                    <span className="shrink-0 whitespace-nowrap text-[17px] font-semibold text-ink">
                      {formatINR(item.price_inr * item.qty)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs uppercase tracking-[0.06em] text-muted">
                    {item.size_label && <span>Size: {item.size_label}</span>}
                    {item.kind === "custom" && <Badge tone="neutral">Custom design</Badge>}
                    {item.dpi_band === "warning" && (
                      <Badge tone="attention">May look soft when printed</Badge>
                    )}
                  </div>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-3">
                    <div className="flex items-center border border-ink/20">
                      <button
                        onClick={() => setQty(id, item.qty - 1)}
                        className="grid h-8 w-8 place-items-center text-ink hover:bg-ink/5"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-9 text-center text-[13px] font-medium text-ink">{item.qty}</span>
                      <button
                        onClick={() => setQty(id, item.qty + 1)}
                        className="grid h-8 w-8 place-items-center text-ink hover:bg-ink/5"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => remove(id)}
                      className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted hover:text-brand-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="border-t border-ink/10 pt-6">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-600 hover:text-brand-700"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>

        <aside className="sticky top-24 w-full border border-ink/10 bg-paper p-8 shadow-card lg:max-w-[400px] lg:flex-1">
          <div className="border-b border-ink/10 pb-4 text-xs font-semibold uppercase tracking-[0.18em] text-ink">
            Order Summary
          </div>
          <dl className="flex flex-col gap-3 py-5 text-sm text-muted">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd className="text-ink">{formatINR(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd className="text-ink">{shipping === 0 ? "Free" : formatINR(shipping)}</dd>
            </div>
          </dl>
          {hasCustom && (
            <p className="mb-5 bg-brand-600/[0.06] px-3.5 py-2.5 text-xs leading-relaxed text-brand-600">
              Custom designs are reviewed before printing — usually within 1–2 business days.
            </p>
          )}
          <div className="flex items-baseline justify-between border-t border-ink/10 pt-4">
            <span className="text-[13px] font-semibold uppercase tracking-[0.1em] text-ink">Total</span>
            <span className="text-[26px] font-bold text-ink">{formatINR(total)}</span>
          </div>
          <Link href="/checkout" className="mt-4 block">
            <span className="flex h-[52px] w-full items-center justify-center bg-brand-600 text-xs font-semibold uppercase tracking-[0.16em] text-cream hover:bg-brand-700">
              Proceed to Checkout
            </span>
          </Link>
          <div className="mt-4 flex flex-col gap-2.5 border-t border-ink/10 pt-4 text-xs leading-relaxed text-muted">
            <div className="flex items-center gap-2.5">
              <span className="text-brand-600">●</span>Secured by Razorpay - UPI, cards, netbanking &amp; wallets
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-brand-600">●</span>Made &amp; shipped from India
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
