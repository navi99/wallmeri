"use client";

import type { PosterSize } from "@/lib/types";
import { formatINR } from "@/lib/utils";

export function SizePicker({
  sizes,
  selected,
  onSelect,
}: {
  sizes: PosterSize[];
  selected: string | null;
  onSelect: (code: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {sizes.map((size) => {
        const active = size.code === selected;
        return (
          <button
            key={size.code}
            type="button"
            onClick={() => onSelect(size.code)}
            aria-pressed={active}
            className={`border px-2.5 py-2.5 text-left transition-colors ${
              active ? "border-ink bg-ink text-cream" : "border-ink/20 bg-paper text-ink hover:border-ink"
            }`}
          >
            <div className="text-sm font-bold uppercase tracking-[0.04em]">{size.code}</div>
            <div className={`mt-0.5 text-[11px] ${active ? "text-cream/70" : "text-muted"}`}>
              {size.width_cm} × {size.height_cm} cm
            </div>
            <div className="mt-1 text-xs font-semibold">{formatINR(size.price_inr)}</div>
          </button>
        );
      })}
    </div>
  );
}
