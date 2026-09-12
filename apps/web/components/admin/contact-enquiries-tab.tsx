"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Badge, Card, Select, Spinner, type BadgeTone } from "@/components/ui";
import { api, ApiError } from "@/lib/api";

// "New" shouts because it's the only one waiting on a human.
const STATUS_TONE: Record<string, BadgeTone> = {
  new: "attention",
  open: "progress",
  resolved: "done",
  spam: "inert",
};

// Mirrors CONTACT_CATEGORIES in components/contact/contact-form.
const CATEGORY_LABELS: Record<string, string> = {
  order: "Order status",
  product: "Product question",
  returns: "Returns & replacements",
  wholesale: "Bulk & corporate",
  artist: "Artist enquiry",
  general: "Something else",
};

export function ContactEnquiriesTab() {
  const qc = useQueryClient();
  const enquiriesQuery = useQuery({
    queryKey: ["admin-contact-enquiries"],
    queryFn: () => api.adminListContactEnquiries(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.adminUpdateContactEnquiry(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-contact-enquiries"] }),
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Update failed"),
  });

  if (enquiriesQuery.isLoading) {
    return (
      <div className="grid place-items-center py-16">
        <Spinner />
      </div>
    );
  }

  const enquiries = enquiriesQuery.data ?? [];

  if (enquiries.length === 0) {
    return (
      <Card className="mt-4 p-10 text-center text-muted">
        No enquiries yet. They arrive here from the contact page form.
      </Card>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {enquiries.map((enq) => (
        <Card key={enq.id} className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-ink">{enq.name}</h3>
                <Badge tone={STATUS_TONE[enq.status] ?? "neutral"}>{enq.status}</Badge>
                <Badge tone="neutral">{CATEGORY_LABELS[enq.category] ?? enq.category}</Badge>
                <span className="text-xs text-muted">
                  {new Date(enq.created_at).toLocaleDateString("en-IN")}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">
                <a href={`mailto:${enq.email}`} className="hover:underline">
                  {enq.email}
                </a>
                {enq.phone ? ` · ${enq.phone}` : ""}
              </p>
              {enq.subject && <p className="mt-2 font-semibold text-ink">{enq.subject}</p>}
              {enq.message && (
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted">
                  {enq.message}
                </p>
              )}
            </div>
            <Select
              value={enq.status}
              onChange={(e) => updateMutation.mutate({ id: enq.id, status: e.target.value })}
              className="w-auto"
              aria-label={`Status for enquiry from ${enq.name}`}
            >
              <option value="new">New</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
              <option value="spam">Spam</option>
            </Select>
          </div>
        </Card>
      ))}
    </div>
  );
}
