"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Stars } from "@/components/stars";
import { Button, Card, Spinner } from "@/components/ui";
import { api, ApiError } from "@/lib/api";

export function ReviewsTab() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">("pending");

  const reviewsQuery = useQuery({
    queryKey: ["admin-reviews", filter],
    queryFn: () => api.adminListReviews(filter),
  });

  const moderate = useMutation({
    mutationFn: ({ id, status, reason }: { id: number; status: string; reason?: string }) =>
      api.adminModerateReview(id, { status, reject_reason: reason ?? "" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
      qc.invalidateQueries({ queryKey: ["reviews"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Moderation failed"),
  });

  const reviews = reviewsQuery.data ?? [];

  return (
    <div>
      <div className="flex gap-2">
        {(["pending", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors ${
              filter === f
                ? "border-ink bg-ink text-cream"
                : "border-ink/20 bg-paper text-ink hover:border-ink"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {reviewsQuery.isLoading ? (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      ) : reviews.length === 0 ? (
        <Card className="mt-4 p-10 text-center text-muted">No {filter} reviews.</Card>
      ) : (
        <div className="mt-4 space-y-4">
          {reviews.map((r) => (
            <Card key={r.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Stars rating={r.rating} />
                    {r.title && <span className="font-semibold text-ink">{r.title}</span>}
                  </div>
                  {r.body && <p className="mt-2 text-sm leading-relaxed text-muted">{r.body}</p>}
                  <p className="mt-2 text-xs text-muted">
                    {r.author_name} ({r.author_email}) on{" "}
                    <Link
                      href={`/product/${r.product_slug}`}
                      className="font-semibold text-brand-600 hover:underline"
                    >
                      {r.product_title}
                    </Link>{" "}
                    · {new Date(r.created_at).toLocaleDateString("en-IN")}
                  </p>
                  {r.status === "rejected" && r.reject_reason && (
                    <p className="mt-1 text-xs text-muted">Reason: {r.reject_reason}</p>
                  )}
                </div>
                {filter !== "approved" && (
                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="sm"
                      onClick={() => moderate.mutate({ id: r.id, status: "approved" })}
                      loading={moderate.isPending}
                    >
                      Approve
                    </Button>
                    {filter === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const reason = prompt("Reason for rejection (shown to the author):") ?? "";
                          moderate.mutate({ id: r.id, status: "rejected", reason });
                        }}
                      >
                        Reject
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
