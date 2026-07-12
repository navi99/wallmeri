"use client";

import Image from "next/image";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import { ArtistForm, type ArtistFormValues } from "@/components/admin/artist-form";
import { Badge, Button, Card, Spinner } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import type { ArtistAdmin } from "@/lib/types";

const CHECKLIST: { key: "identity_verified" | "agreement_received" | "contact_verified"; label: string }[] = [
  { key: "identity_verified", label: "Identity verified" },
  { key: "agreement_received", label: "Agreement received" },
  { key: "contact_verified", label: "Contact verified" },
];

export function ArtistsTab() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ArtistAdmin | null>(null);

  const artistsQuery = useQuery({
    queryKey: ["admin-artists"],
    queryFn: () => api.adminListArtists(),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-artists"] });
    qc.invalidateQueries({ queryKey: ["artists"] });
  };

  const saveMutation = useMutation({
    mutationFn: (values: ArtistFormValues) =>
      editing ? api.adminUpdateArtist(editing.id, values) : api.adminCreateArtist(values),
    onSuccess: () => {
      toast.success(editing ? "Artist updated" : "Artist created");
      invalidate();
      setFormOpen(false);
      setEditing(null);
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Save failed"),
  });

  const patchMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
      api.adminUpdateArtist(id, body),
    onSuccess: invalidate,
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Update failed"),
  });

  if (artistsQuery.isLoading) {
    return (
      <div className="grid place-items-center py-16">
        <Spinner />
      </div>
    );
  }

  const artists = artistsQuery.data ?? [];

  return (
    <div>
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add artist
        </Button>
      </div>

      {artists.length === 0 ? (
        <Card className="mt-4 p-10 text-center text-muted">
          No artists yet. Onboard your first artist from an application or add one directly.
        </Card>
      ) : (
        <div className="mt-4 space-y-4">
          {artists.map((a) => {
            const checklistDone = CHECKLIST.every((c) => a[c.key]);
            return (
              <Card key={a.id} className="p-5">
                <div className="flex flex-wrap items-start gap-4">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-brand-50">
                    {a.avatar_url && (
                      <Image src={a.avatar_url} alt={a.name} fill sizes="56px" className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-ink">{a.name}</h3>
                      {a.is_active ? (
                        <Badge className="bg-green-100 text-green-800">Live</Badge>
                      ) : (
                        <Badge>Not live</Badge>
                      )}
                      <span className="text-xs text-muted">
                        {a.product_count} poster{a.product_count === 1 ? "" : "s"}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm text-muted">{a.bio}</p>

                    {/* Verification checklist */}
                    <div className="mt-3 flex flex-wrap gap-4">
                      {CHECKLIST.map((c) => (
                        <label key={c.key} className="flex items-center gap-1.5 text-sm text-ink">
                          <input
                            type="checkbox"
                            checked={a[c.key]}
                            onChange={(e) =>
                              patchMutation.mutate({ id: a.id, body: { [c.key]: e.target.checked } })
                            }
                            className="h-4 w-4 accent-brand-600"
                          />
                          {c.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      size="sm"
                      variant={a.is_active ? "outline" : "primary"}
                      disabled={!a.is_active && !checklistDone}
                      title={
                        !a.is_active && !checklistDone
                          ? "Complete the verification checklist first"
                          : undefined
                      }
                      onClick={() =>
                        patchMutation.mutate({ id: a.id, body: { is_active: !a.is_active } })
                      }
                    >
                      {a.is_active ? "Deactivate" : "Activate"}
                    </Button>
                    <button
                      onClick={() => {
                        setEditing(a);
                        setFormOpen(true);
                      }}
                      className="rounded-lg p-2 text-muted hover:bg-brand-50 hover:text-brand-600"
                      aria-label={`Edit ${a.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {formOpen && (
        <ArtistForm
          artist={editing}
          submitting={saveMutation.isPending}
          onSubmit={(values) => saveMutation.mutate(values)}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
