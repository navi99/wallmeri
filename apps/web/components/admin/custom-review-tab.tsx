"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { toast } from "sonner";

import Image from "@/components/app-image";
import { Badge, Button, Card, Spinner, Textarea, type BadgeTone } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import type { CustomReviewOrder, DpiBand } from "@/lib/types";
import { formatINR } from "@/lib/utils";

const DPI_TONE: Record<DpiBand, BadgeTone> = {
  ok: "done",
  warning: "attention",
  blocked: "danger",
};

function RejectDialog({
  order,
  onConfirm,
  onClose,
  submitting,
}: {
  order: CustomReviewOrder;
  onConfirm: (note: string) => void;
  onClose: () => void;
  submitting: boolean;
}) {
  const [note, setNote] = useState("");
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4">
      <div className="w-full max-w-sm border border-ink/10 bg-paper p-6 shadow-lift">
        <h2 className="text-lg font-bold uppercase tracking-[0.04em] text-ink">
          Reject order #{order.id}
        </h2>
        <p className="mt-1 text-sm text-muted">
          The customer is fully refunded and shown this reason.
        </p>
        <Textarea
          className="mt-4"
          rows={3}
          placeholder="e.g. Copyrighted / trademarked artwork"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={submitting}
            disabled={note.trim().length === 0}
            onClick={() => onConfirm(note.trim())}
          >
            Reject &amp; refund
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CustomReviewTab() {
  const qc = useQueryClient();
  const [rejecting, setRejecting] = useState<CustomReviewOrder | null>(null);

  const queueQuery = useQuery({
    queryKey: ["admin-custom-review"],
    queryFn: () => api.adminListCustomReview(),
  });

  const actionMutation = useMutation({
    mutationFn: ({
      orderId,
      action,
      note,
    }: {
      orderId: number;
      action: "approve" | "reject";
      note: string;
    }) => api.adminCustomReview(orderId, { action, note }),
    onSuccess: (_, vars) => {
      toast.success(
        vars.action === "approve" ? `Order #${vars.orderId} approved` : `Order #${vars.orderId} rejected`,
      );
      qc.invalidateQueries({ queryKey: ["admin-custom-review"] });
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      // Approving/rejecting flips the order's status, which the customer-facing
      // order list/detail pages also cache — keep every surface in sync instead
      // of waiting for their staleTime to lapse.
      qc.invalidateQueries({ queryKey: ["my-orders"] });
      qc.invalidateQueries({ queryKey: ["order"] });
      setRejecting(null);
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Action failed"),
  });

  const downloadPrintFile = (customUploadId: number, orderId: number, sizeCode: string) => {
    api
      .adminDownloadPrintFile(customUploadId, `wallmeri_custom_${orderId}_${customUploadId}_${sizeCode}.jpg`)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Download failed"));
  };

  if (queueQuery.isLoading) {
    return (
      <div className="grid place-items-center py-16">
        <Spinner />
      </div>
    );
  }

  const orders = queueQuery.data ?? [];
  if (orders.length === 0) {
    return <Card className="mt-4 p-10 text-center text-muted">No custom orders awaiting review.</Card>;
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const busyApprove =
          actionMutation.isPending &&
          actionMutation.variables?.orderId === order.id &&
          actionMutation.variables?.action === "approve";
        return (
          <Card key={order.id} className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="font-bold text-ink">Order #{order.id}</span>
                <span className="ml-2 text-sm text-muted">{order.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-ink">{formatINR(order.total_inr)}</span>
                <Button size="sm" variant="outline" onClick={() => setRejecting(order)}>
                  Reject
                </Button>
                <Button
                  size="sm"
                  loading={busyApprove}
                  onClick={() => actionMutation.mutate({ orderId: order.id, action: "approve", note: "" })}
                >
                  Approve
                </Button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {order.custom_lines.map((line) => (
                <div key={line.order_item_id} className="flex gap-3 border border-ink/10 bg-cream p-3">
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-ink/5">
                    <Image src={line.preview_url} alt={line.title} fill className="object-cover" sizes="80px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{line.title}</p>
                    <p className="text-xs capitalize text-muted">
                      {line.orientation} · qty {line.qty}
                    </p>
                    <Badge tone={DPI_TONE[line.dpi_band]} className="mt-1.5">
                      {line.dpi} DPI
                    </Badge>
                    <button
                      onClick={() => downloadPrintFile(line.custom_upload_id, order.id, line.size_code)}
                      className="mt-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.05em] text-brand-600 hover:underline"
                    >
                      <Download className="h-3 w-3" /> Print file
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {order.other_lines.length > 0 && (
              <p className="mt-3 text-xs text-muted">
                Also in this order: {order.other_lines.map((l) => `${l.title_snapshot} × ${l.qty}`).join(", ")}
              </p>
            )}
          </Card>
        );
      })}

      {rejecting && (
        <RejectDialog
          order={rejecting}
          submitting={actionMutation.isPending}
          onClose={() => setRejecting(null)}
          onConfirm={(note) => actionMutation.mutate({ orderId: rejecting.id, action: "reject", note })}
        />
      )}
    </div>
  );
}
