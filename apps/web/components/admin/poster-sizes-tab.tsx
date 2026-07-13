"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Badge, Button, Card, Input, Spinner } from "@/components/ui";
import { api, ApiError } from "@/lib/api";

const emptyForm = { code: "", label: "", width_cm: "", height_cm: "", price_inr: "", delta_inr: "0" };

export function PosterSizesTab() {
  const qc = useQueryClient();
  const [form, setForm] = useState(emptyForm);

  const sizesQuery = useQuery({
    queryKey: ["admin-poster-sizes"],
    queryFn: () => api.adminListPosterSizes(),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-poster-sizes"] });

  const createMutation = useMutation({
    mutationFn: () =>
      api.adminCreatePosterSize({
        code: form.code.trim().toUpperCase(),
        label: form.label.trim(),
        width_cm: Number(form.width_cm),
        height_cm: Number(form.height_cm),
        price_inr: Number(form.price_inr),
        delta_inr: Number(form.delta_inr) || 0,
        is_enabled: false,
        position: sizesQuery.data?.length ?? 0,
      }),
    onSuccess: () => {
      toast.success("Size added");
      setForm(emptyForm);
      invalidate();
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Create failed"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
      api.adminUpdatePosterSize(id, body),
    onSuccess: invalidate,
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Update failed"),
  });

  if (sizesQuery.isLoading) {
    return (
      <div className="grid place-items-center py-16">
        <Spinner />
      </div>
    );
  }

  const canCreate =
    form.code.trim().length > 0 &&
    form.label.trim().length > 0 &&
    Number(form.width_cm) > 0 &&
    Number(form.height_cm) > 0 &&
    Number(form.price_inr) > 0;

  return (
    <div className="max-w-2xl">
      <div className="space-y-2">
        {(sizesQuery.data ?? []).map((size) => (
          <Card key={size.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold uppercase tracking-[0.04em] text-ink">{size.code}</span>
                <span className="text-sm text-muted">{size.label}</span>
                {size.is_enabled ? <Badge tone="progress">Live</Badge> : <Badge tone="inert">Hidden</Badge>}
              </div>
              <p className="mt-0.5 text-xs text-muted">
                {size.width_cm} × {size.height_cm} cm
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-sm text-muted">
                <span>₹</span>
                <Input
                  type="number"
                  defaultValue={size.price_inr}
                  onBlur={(e) => {
                    const price_inr = Number(e.target.value);
                    if (Number.isFinite(price_inr) && price_inr > 0 && price_inr !== size.price_inr) {
                      updateMutation.mutate({ id: size.id, body: { price_inr } });
                    }
                  }}
                  className="w-24"
                  aria-label={`Custom-upload price for ${size.code}`}
                />
              </div>
              <div className="flex items-center gap-1 text-sm text-muted">
                <span>Δ</span>
                <Input
                  type="number"
                  defaultValue={size.delta_inr}
                  onBlur={(e) => {
                    const delta_inr = Number(e.target.value);
                    if (Number.isFinite(delta_inr) && delta_inr !== size.delta_inr) {
                      updateMutation.mutate({ id: size.id, body: { delta_inr } });
                    }
                  }}
                  className="w-20"
                  aria-label={`Product price delta vs A4 for ${size.code}`}
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  updateMutation.mutate({ id: size.id, body: { is_enabled: !size.is_enabled } })
                }
              >
                {size.is_enabled ? "Disable" : "Enable"}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canCreate) createMutation.mutate();
        }}
        className="mt-5 grid grid-cols-2 gap-2 border border-ink/10 bg-paper p-4 sm:grid-cols-6"
      >
        <Input
          placeholder="Code (A1)"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
        />
        <Input
          placeholder="Label"
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          className="sm:col-span-2"
        />
        <Input
          placeholder="Width cm"
          type="number"
          value={form.width_cm}
          onChange={(e) => setForm({ ...form, width_cm: e.target.value })}
        />
        <Input
          placeholder="Height cm"
          type="number"
          value={form.height_cm}
          onChange={(e) => setForm({ ...form, height_cm: e.target.value })}
        />
        <Input
          placeholder="Custom-upload price ₹"
          type="number"
          value={form.price_inr}
          onChange={(e) => setForm({ ...form, price_inr: e.target.value })}
          className="col-span-2 sm:col-span-1"
        />
        <Input
          placeholder="Δ vs A4 ₹"
          type="number"
          value={form.delta_inr}
          onChange={(e) => setForm({ ...form, delta_inr: e.target.value })}
        />
        <Button
          type="submit"
          loading={createMutation.isPending}
          disabled={!canCreate}
          className="col-span-2 sm:col-span-6"
        >
          <Plus className="h-4 w-4" /> Add size
        </Button>
      </form>
      <p className="mt-3 text-xs text-muted">
        New sizes start disabled — enable once you&apos;re happy with the price. Custom orders
        already in a cart or order keep the price they were created with, even if you reprice
        later. Price is what a &quot;Create your own&quot; upload costs at this size; Δ vs A4
        is added to (or subtracted from) each regular product&apos;s own price — which is always
        set for A4 — to get its price at this size.
      </p>
    </div>
  );
}
