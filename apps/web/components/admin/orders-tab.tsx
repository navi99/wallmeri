"use client";

import { Fragment, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Badge, Button, Card, Input, Label, Spinner } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import type { Order, OrderStatus } from "@/lib/types";
import { formatINR } from "@/lib/utils";

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-green-100 text-green-800",
  shipped: "bg-blue-100 text-blue-800",
  delivered: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-600",
  refunded: "bg-purple-100 text-purple-800",
};

// Mirrors the server-side transition map (the server enforces it regardless).
const NEXT_ACTIONS: Record<string, { to: OrderStatus; label: string }[]> = {
  paid: [
    { to: "shipped", label: "Mark shipped" },
    { to: "cancelled", label: "Cancel" },
    { to: "refunded", label: "Refund" },
  ],
  shipped: [
    { to: "delivered", label: "Mark delivered" },
    { to: "refunded", label: "Refund" },
  ],
  delivered: [{ to: "refunded", label: "Refund" }],
};

function ShipDialog({
  order,
  onConfirm,
  onClose,
  submitting,
}: {
  order: Order;
  onConfirm: (courier: string, tracking: string) => void;
  onClose: () => void;
  submitting: boolean;
}) {
  const [courier, setCourier] = useState(order.courier_name);
  const [tracking, setTracking] = useState(order.tracking_number);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-paper p-6 shadow-xl">
        <h2 className="text-lg font-bold text-ink">Ship order #{order.id}</h2>
        <div className="mt-4 space-y-3">
          <div>
            <Label htmlFor="courier">Courier</Label>
            <Input
              id="courier"
              placeholder="e.g. Delhivery"
              value={courier}
              onChange={(e) => setCourier(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="tracking">Tracking number</Label>
            <Input
              id="tracking"
              placeholder="AWB / tracking id"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={submitting} onClick={() => onConfirm(courier, tracking)}>
            Confirm shipped
          </Button>
        </div>
      </div>
    </div>
  );
}

export function OrdersTab() {
  const qc = useQueryClient();
  const [shipping, setShipping] = useState<Order | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  const ordersQuery = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => api.adminListOrders(),
  });

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      courier,
      tracking,
    }: {
      id: number;
      status: string;
      courier?: string;
      tracking?: string;
    }) =>
      api.adminUpdateOrderStatus(id, {
        status,
        courier_name: courier,
        tracking_number: tracking,
      }),
    onSuccess: (_, vars) => {
      toast.success(`Order #${vars.id} → ${vars.status}`);
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      setShipping(null);
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Update failed"),
  });

  if (ordersQuery.isLoading) {
    return (
      <div className="grid place-items-center py-16">
        <Spinner />
      </div>
    );
  }

  const orders = ordersQuery.data ?? [];
  if (orders.length === 0) {
    return <Card className="mt-4 p-10 text-center text-muted">No orders yet.</Card>;
  }

  return (
    <Card className="mt-4 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream text-left text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Total</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-50">
            {orders.map((o) => (
              <Fragment key={o.id}>
                <tr
                  className="cursor-pointer hover:bg-cream/50"
                  onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                >
                  <td className="px-4 py-3 font-medium text-ink">#{o.id}</td>
                  <td className="px-4 py-3 text-muted">{o.email}</td>
                  <td className="px-4 py-3 font-semibold text-ink">{formatINR(o.total_inr)}</td>
                  <td className="px-4 py-3">
                    <Badge className={STATUS_BADGE[o.status] ?? ""}>{o.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(o.created_at).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-2">
                      {(NEXT_ACTIONS[o.status] ?? []).map(({ to, label }) => (
                        <Button
                          key={to}
                          size="sm"
                          variant={to === "shipped" || to === "delivered" ? "primary" : "outline"}
                          onClick={() => {
                            if (to === "shipped") setShipping(o);
                            else if (
                              to !== "refunded" ||
                              confirm(`Refund order #${o.id} (${formatINR(o.total_inr)})?`)
                            )
                              statusMutation.mutate({ id: o.id, status: to });
                          }}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </td>
                </tr>
                {expanded === o.id && (
                  <tr className="bg-cream/40">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="font-semibold text-ink">Items</p>
                          <ul className="mt-1 space-y-1 text-muted">
                            {o.items.map((it, i) => (
                              <li key={i}>
                                {it.title_snapshot} × {it.qty} — {formatINR(it.price_inr * it.qty)}
                              </li>
                            ))}
                          </ul>
                          {o.tracking_number && (
                            <p className="mt-2 text-muted">
                              {o.courier_name} · {o.tracking_number}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-ink">Ship to</p>
                          <p className="mt-1 text-muted">
                            {o.shipping_address.full_name}
                            <br />
                            {o.shipping_address.line1}
                            {o.shipping_address.line2 ? `, ${o.shipping_address.line2}` : ""}
                            <br />
                            {o.shipping_address.city}, {o.shipping_address.state}{" "}
                            {o.shipping_address.pincode}
                            <br />
                            {o.shipping_address.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {shipping && (
        <ShipDialog
          order={shipping}
          submitting={statusMutation.isPending}
          onClose={() => setShipping(null)}
          onConfirm={(courier, tracking) =>
            statusMutation.mutate({ id: shipping.id, status: "shipped", courier, tracking })
          }
        />
      )}
    </Card>
  );
}
