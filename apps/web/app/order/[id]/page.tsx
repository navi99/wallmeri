"use client";

import Image from "@/components/app-image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";

import { Button, Card, Spinner } from "@/components/ui";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/utils";

function statusLabel(status: string) {
  const map: Record<string, string> = {
    paid: "Paid — being prepared",
    pending: "Pending payment",
    shipped: "Shipped",
    delivered: "Delivered",
    failed: "Payment failed",
    cancelled: "Cancelled",
    refunded: "Refunded",
  };
  return map[status] ?? status;
}

function OrderContent({ id }: { id: number }) {
  const params = useSearchParams();
  const email = params.get("email") ?? undefined;

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["order", id, email],
    queryFn: () => api.getOrder(id, email),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="grid place-items-center py-32">
        <Spinner />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl font-bold uppercase tracking-tight text-ink">Order not found</h1>
        <p className="mt-2 text-muted">
          We couldn&apos;t find this order. If you checked out as a guest, open the
          confirmation link from your email.
        </p>
        <Link href="/" className="mt-4 inline-block font-semibold text-brand-600 hover:underline">
          Back home
        </Link>
      </div>
    );
  }

  const addr = order.shipping_address;

  return (
    <div className="container-page max-w-3xl py-12">
      <div className="text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-50 text-brand-600">
          <CheckCircle2 className="h-9 w-9" />
        </span>
        <h1 className="mt-4 text-3xl font-bold uppercase tracking-tight text-ink">Thank you for your order!</h1>
        <p className="mt-2 text-muted">
          Order <span className="font-semibold text-ink">#{order.id}</span> ·{" "}
          {statusLabel(order.status)}
        </p>
      </div>

      <Card className="mt-8 p-6">
        <h2 className="text-lg font-bold text-ink">Items</h2>
        <div className="mt-4 space-y-3">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-brand-50">
                {item.image_snapshot && (
                  <Image src={item.image_snapshot} alt={item.title_snapshot} fill className="object-cover" sizes="56px" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{item.title_snapshot}</p>
                <p className="text-sm text-muted">Qty {item.qty}</p>
              </div>
              <span className="font-semibold text-ink">
                {formatINR(item.price_inr * item.qty)}
              </span>
            </div>
          ))}
        </div>

        <dl className="mt-5 space-y-2 border-t border-brand-100 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd className="font-semibold text-ink">{formatINR(order.subtotal_inr)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Shipping</dt>
            <dd className="font-semibold text-ink">
              {order.shipping_inr === 0 ? "Free" : formatINR(order.shipping_inr)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-brand-100 pt-2 text-base">
            <dt className="font-bold text-ink">Total</dt>
            <dd className="font-bold text-ink">{formatINR(order.total_inr)}</dd>
          </div>
        </dl>
      </Card>

      {(order.status === "shipped" || order.status === "delivered") &&
        (order.courier_name || order.tracking_number) && (
          <Card className="mt-4 p-6">
            <h2 className="text-lg font-bold text-ink">Tracking</h2>
            <p className="mt-2 text-sm text-muted">
              {order.courier_name && (
                <>
                  Courier: <span className="font-medium text-ink">{order.courier_name}</span>
                  <br />
                </>
              )}
              {order.tracking_number && (
                <>
                  Tracking number:{" "}
                  <span className="font-medium text-ink">{order.tracking_number}</span>
                </>
              )}
            </p>
          </Card>
        )}

      <Card className="mt-4 p-6">
        <h2 className="text-lg font-bold text-ink">Shipping to</h2>
        <address className="mt-2 not-italic text-sm text-muted">
          <span className="font-medium text-ink">{addr.full_name}</span>
          <br />
          {addr.line1}
          {addr.line2 ? `, ${addr.line2}` : ""}
          <br />
          {addr.city}, {addr.state} {addr.pincode}
          <br />
          {addr.phone}
        </address>
      </Card>

      <div className="mt-8 flex justify-center gap-3">
        <Link href="/catalog">
          <Button size="lg">Continue shopping</Button>
        </Link>
        <Link href="/orders">
          <Button size="lg" variant="outline">
            View my orders
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function OrderPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  return (
    <Suspense fallback={<div className="grid place-items-center py-32"><Spinner /></div>}>
      <OrderContent id={id} />
    </Suspense>
  );
}
