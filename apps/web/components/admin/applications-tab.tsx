"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { Badge, Card, Select, Spinner } from "@/components/ui";
import { api, ApiError } from "@/lib/api";

const STATUS_BADGE: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-amber-100 text-amber-800",
  onboarded: "bg-green-100 text-green-800",
  rejected: "bg-gray-100 text-gray-600",
};

export function ApplicationsTab() {
  const qc = useQueryClient();
  const applicationsQuery = useQuery({
    queryKey: ["admin-applications"],
    queryFn: () => api.adminListApplications(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.adminUpdateApplication(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-applications"] }),
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Update failed"),
  });

  if (applicationsQuery.isLoading) {
    return (
      <div className="grid place-items-center py-16">
        <Spinner />
      </div>
    );
  }

  const applications = applicationsQuery.data ?? [];

  if (applications.length === 0) {
    return (
      <Card className="mt-4 p-10 text-center text-muted">
        No artist applications yet. They arrive here from the “Become a Wallmeri artist” page.
      </Card>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {applications.map((app) => (
        <Card key={app.id} className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-ink">{app.name}</h3>
                <Badge className={STATUS_BADGE[app.status] ?? ""}>{app.status}</Badge>
                <span className="text-xs text-muted">
                  {new Date(app.created_at).toLocaleDateString("en-IN")}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">
                {app.email}
                {app.phone ? ` · ${app.phone}` : ""}
              </p>
              {app.portfolio_url && (
                <a
                  href={app.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline"
                >
                  Portfolio <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              {app.pitch && (
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted">
                  {app.pitch}
                </p>
              )}
            </div>
            <Select
              value={app.status}
              onChange={(e) => updateMutation.mutate({ id: app.id, status: e.target.value })}
              className="w-auto"
              aria-label={`Status for ${app.name}`}
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="onboarded">Onboarded</option>
              <option value="rejected">Rejected</option>
            </Select>
          </div>
        </Card>
      ))}
    </div>
  );
}
