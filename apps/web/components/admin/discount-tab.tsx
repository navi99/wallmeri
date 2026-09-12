"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Badge, Button, Card, Input, Label, Spinner } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { applyDiscount } from "@/lib/discount";
import { formatINR } from "@/lib/utils";

// Mirrors MAX_DISCOUNT_PERCENT in apps/api/app/models/discount.py. The
// backend validates (422) and the DB has a check constraint; this only keeps
// the input from offering something that would bounce.
const MAX_PERCENT = 90;

// An arbitrary but representative poster price, purely so the admin can see
// what the change will look like on the storefront before saving.
const PREVIEW_PRICE = 2499;

export function DiscountTab() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ percent: "0", label: "", is_active: false });

  const discountQuery = useQuery({
    queryKey: ["admin-discount"],
    queryFn: () => api.adminGetDiscount(),
  });

  const saved = discountQuery.data;
  useEffect(() => {
    if (saved) {
      setForm({
        percent: String(saved.percent),
        label: saved.label,
        is_active: saved.is_active,
      });
    }
  }, [saved]);

  const saveMutation = useMutation({
    mutationFn: () =>
      api.adminUpdateDiscount({
        percent: Number(form.percent) || 0,
        label: form.label.trim(),
        is_active: form.is_active,
      }),
    onSuccess: (next) => {
      toast.success(
        next.is_active && next.percent > 0
          ? `Discount live - ${next.percent}% off site-wide`
          : "Discount turned off",
      );
      // Per CLAUDE.md: every cached key that surfaces a price has to go, not
      // just this tab's. A stale ["products"] or ["quote"] would keep showing
      // pre-sale figures for up to its staleTime.
      for (const key of [
        ["admin-discount"],
        ["discount"],
        ["products"],
        ["product"],
        ["poster-sizes"],
        ["quote"],
      ]) {
        qc.invalidateQueries({ queryKey: key });
      }
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Save failed"),
  });

  if (discountQuery.isLoading) {
    return (
      <div className="grid place-items-center py-16">
        <Spinner />
      </div>
    );
  }

  const percent = Number(form.percent);
  const percentValid = Number.isInteger(percent) && percent >= 0 && percent <= MAX_PERCENT;
  const dirty =
    !!saved &&
    (percent !== saved.percent ||
      form.label.trim() !== saved.label ||
      form.is_active !== saved.is_active);
  const willBeLive = form.is_active && percentValid && percent > 0;

  return (
    <div className="max-w-2xl">
      <Card className="p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="title-xs">Site-wide discount</h2>
            <p className="mt-1 text-sm text-muted">
              One percentage off every poster and custom upload. Original paintings are
              never discounted.
            </p>
          </div>
          {saved?.is_active && saved.percent > 0 ? (
            <Badge tone="progress">Live</Badge>
          ) : (
            <Badge tone="inert">Off</Badge>
          )}
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="discount-percent">Percent off</Label>
            <Input
              id="discount-percent"
              type="number"
              min={0}
              max={MAX_PERCENT}
              value={form.percent}
              onChange={(e) => setForm({ ...form, percent: e.target.value })}
            />
            <p className="mt-1 text-xs text-muted">
              0-{MAX_PERCENT}. Set to 0 to show list prices everywhere.
            </p>
          </div>
          <div>
            <Label htmlFor="discount-label">Occasion</Label>
            <Input
              id="discount-label"
              value={form.label}
              maxLength={80}
              placeholder="Diwali"
              onChange={(e) => setForm({ ...form, label: e.target.value })}
            />
            <p className="mt-1 text-xs text-muted">
              Shown quietly beside discounted prices. Optional.
            </p>
          </div>
        </div>

        <label className="mt-5 flex items-center gap-3 text-sm text-ink">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            className="h-4 w-4 accent-brand-600"
          />
          Discount is live on the storefront
        </label>

        {/* Base prices are never rewritten, so turning this off restores
            list prices exactly - nothing to undo by hand. */}
        <div className="mt-6 border-t border-line pt-5 text-sm">
          <div className="label text-xs text-muted">Preview</div>
          <p className="mt-2 text-ink">
            {willBeLive ? (
              <>
                A {formatINR(PREVIEW_PRICE)} poster will show as{" "}
                <span className="font-semibold">
                  {formatINR(applyDiscount(PREVIEW_PRICE, percent))}
                </span>{" "}
                <s className="text-muted">{formatINR(PREVIEW_PRICE)}</s>
              </>
            ) : (
              <>Prices show as normal - {formatINR(PREVIEW_PRICE)}.</>
            )}
          </p>
        </div>

        <Button
          className="mt-6"
          onClick={() => saveMutation.mutate()}
          loading={saveMutation.isPending}
          disabled={!dirty || !percentValid}
        >
          Save
        </Button>
        {!percentValid && (
          <p className="mt-2 text-xs text-brand-600">
            Enter a whole number between 0 and {MAX_PERCENT}.
          </p>
        )}
      </Card>

      <p className="mt-4 text-xs leading-relaxed text-muted">
        Poster and size prices in the other tabs stay the list prices - the discount is
        applied on top at display and checkout, so ending a sale restores them exactly.
        Orders already placed keep the discount they were bought under.
      </p>
    </div>
  );
}
