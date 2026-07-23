"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";

import { Badge, Card, Select, Spinner, type BadgeTone } from "@/components/ui";
import { api, ApiError } from "@/lib/api";

// "New" shouts because it's the only one waiting on a human.
const STATUS_TONE: Record<string, BadgeTone> = {
  new: "attention",
  contacted: "progress",
  negotiating: "progress",
  won: "done",
  lost: "inert",
};

export function OriginalInquiriesTab() {
  const qc = useQueryClient();
  const inquiriesQuery = useQuery({
    queryKey: ["admin-original-inquiries"],
    queryFn: () => api.adminListOriginalInquiries(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.adminUpdateOriginalInquiry(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-original-inquiries"] }),
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Update failed"),
  });

  if (inquiriesQuery.isLoading) {
    return (
      <div className="grid place-items-center py-16">
        <Spinner />
      </div>
    );
  }

  const inquiries = inquiriesQuery.data ?? [];

  if (inquiries.length === 0) {
    return (
      <Card className="mt-4 p-10 text-center text-muted">
        No original-painting leads yet. They arrive here from a poster&apos;s “Buy Original” page.
      </Card>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {inquiries.map((inq) => (
        <Card key={inq.id} className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-ink">{inq.name}</h3>
                <Badge tone={STATUS_TONE[inq.status] ?? "neutral"}>{inq.status}</Badge>
                <span className="text-xs text-muted">
                  {new Date(inq.created_at).toLocaleDateString("en-IN")}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">
                {inq.email}
                {inq.phone ? ` · ${inq.phone}` : ""}
              </p>
              {inq.product_slug && (
                <Link
                  href={`/product/${inq.product_slug}/original`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline"
                >
                  {inq.product_title || "View original"}
                </Link>
              )}
              {inq.message && (
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted">
                  {inq.message}
                </p>
              )}
            </div>
            <Select
              value={inq.status}
              onChange={(e) => updateMutation.mutate({ id: inq.id, status: e.target.value })}
              className="w-auto"
              aria-label={`Status for ${inq.name}`}
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="negotiating">Negotiating</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </Select>
          </div>
        </Card>
      ))}
    </div>
  );
}
