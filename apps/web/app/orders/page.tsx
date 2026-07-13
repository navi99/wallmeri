"use client";

import Image from "@/components/app-image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { Badge, Button, Card, Spinner } from "@/components/ui";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/store/auth";
import { formatINR } from "@/lib/utils";

function statusBadge(status: string) {
  if (status === "paid") return <Badge tone="done">Paid</Badge>;
  if (status === "pending") return <Badge tone="inert">Pending</Badge>;
  if (status === "in_review") return <Badge tone="attention">In review</Badge>;
  return <Badge tone="neutral">{status}</Badge>;
}

function customApprovalBadge(status: string) {
  if (status === "in_review") return <Badge tone="attention">Pending review</Badge>;
  if (status === "refunded") return <Badge tone="danger">Rejected</Badge>;
  if (status === "pending" || status === "failed" || status === "cancelled") return null;
  return <Badge tone="done">Approved</Badge>;
}

export default function OrdersPage() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const hydrated = useAuth((s) => s.hydrated);

  useEffect(() => {
    if (hydrated && !user) router.replace("/login?next=/orders");
  }, [hydrated, user, router]);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => api.myOrders(),
    enabled: !!user,
  });

  if (!hydrated || (!user && hydrated)) {
    return <div className="grid place-items-center py-32"><Spinner /></div>;
  }

  return (
    <div className="container-page py-8">
      <h1 className="text-3xl font-bold uppercase tracking-tight text-ink">Your orders</h1>

      {isLoading ? (
        <div className="grid place-items-center py-24"><Spinner /></div>
      ) : !orders || orders.length === 0 ? (
        <Card className="mt-6 p-12 text-center">
          <p className="text-lg font-semibold text-ink">No orders yet</p>
          <p className="mt-1 text-muted">When you place an order, it&apos;ll show up here.</p>
          <Link href="/catalog" className="mt-5 inline-block">
            <Button>Browse posters</Button>
          </Link>
        </Card>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ink">Order #{order.id}</span>
                    {statusBadge(order.status)}
                  </div>
                  <p className="mt-0.5 text-sm text-muted">
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    · {order.items.reduce((n, i) => n + i.qty, 0)} item(s)
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-ink">{formatINR(order.total_inr)}</span>
                  <Link href={`/order/${order.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-2">
                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-cream">
                      {item.image_snapshot && (
                        <Image
                          src={item.image_snapshot}
                          alt={item.title_snapshot}
                          fill
                          className="object-cover"
                          sizes="36px"
                        />
                      )}
                    </div>
                    <span className="text-xs text-muted">
                      {item.title_snapshot} × {item.qty}
                    </span>
                    {item.is_custom && customApprovalBadge(order.status)}
                    {!item.is_custom && item.slug_snapshot && (
                      <Link
                        href={`/product/${item.slug_snapshot}`}
                        className="text-xs font-semibold text-brand-600 hover:underline"
                      >
                        View product
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
