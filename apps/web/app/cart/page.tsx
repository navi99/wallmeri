"use client";

import Image from "@/components/app-image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

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
  const hasCustom = items.some((i) => i.kind === "custom");

  if (!mounted) {
    return <div className="container-page py-24" />;
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-600">
          <ShoppingBag className="h-8 w-8" />
        </span>
        <h1 className="mt-5 text-2xl font-bold uppercase tracking-tight text-ink">Your cart is empty</h1>
        <p className="mt-2 text-muted">Find a poster you love and add it here.</p>
        <Link href="/catalog" className="mt-6 inline-block">
          <Button size="lg">Browse posters</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="text-3xl font-bold uppercase tracking-tight text-ink">Your cart</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {items.map((item) => {
            const id = lineId(item);
            const thumb = (
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-brand-50">
                <Image src={item.image_url} alt={item.title} fill className="object-cover" sizes="80px" />
              </div>
            );
            return (
              <div key={id} className="flex gap-4 rounded-2xl border border-brand-100 bg-paper p-4">
                {item.kind === "product" ? (
                  <Link href={`/product/${item.slug}`} className="shrink-0 overflow-hidden rounded-xl">
                    {thumb}
                  </Link>
                ) : (
                  thumb
                )}
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {item.kind === "product" ? (
                        <Link href={`/product/${item.slug}`} className="font-semibold text-ink hover:text-brand-600">
                          {item.title}
                        </Link>
                      ) : (
                        <span className="font-semibold text-ink">{item.title}</span>
                      )}
                      {item.kind === "custom" && (
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <Badge tone="neutral">Custom design</Badge>
                          {item.dpi_band === "warning" && (
                            <Badge tone="attention">May look soft when printed</Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => remove(id)}
                      className="text-muted hover:text-brand-600"
                      aria-label={`Remove ${item.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm text-muted">{formatINR(item.price_inr)} each</p>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center rounded-lg border border-brand-200">
                      <button
                        onClick={() => setQty(id, item.qty - 1)}
                        className="grid h-9 w-9 place-items-center text-ink hover:bg-brand-50"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
                      <button
                        onClick={() => setQty(id, item.qty + 1)}
                        className="grid h-9 w-9 place-items-center text-ink hover:bg-brand-50"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="font-bold text-ink">
                      {formatINR(item.price_inr * item.qty)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="h-fit rounded-2xl border border-brand-100 bg-paper p-6">
          <h2 className="text-lg font-bold text-ink">Order summary</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="font-semibold text-ink">{formatINR(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Shipping</dt>
              <dd className="font-semibold text-ink">
                {shipping === 0 ? "Free" : formatINR(shipping)}
              </dd>
            </div>
            {hasCustom && (
              <p className="rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-600">
                Custom designs are reviewed before printing — usually within 1-2 business days.
              </p>
            )}
            <div className="flex justify-between border-t border-brand-100 pt-3 text-base">
              <dt className="font-bold text-ink">Total</dt>
              <dd className="font-bold text-ink">{formatINR(total)}</dd>
            </div>
          </dl>
          <Link href="/checkout" className="mt-5 block">
            <Button size="lg" className="w-full">
              Proceed to checkout
            </Button>
          </Link>
          <Link
            href="/catalog"
            className="mt-3 block text-center text-sm font-medium text-brand-600 hover:underline"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
