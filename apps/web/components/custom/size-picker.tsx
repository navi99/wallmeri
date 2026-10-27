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
              active ? "border-ink bg-ink text-cream" : "border-line bg-paper text-ink hover:border-ink"
            }`}
          >
            {/* Dimensions, not `size.code` - the code is an internal key ("A3")
                that doesn't describe what the buyer gets: the size we print is
                30 × 40 cm, not the 29.7 × 42 cm ISO A3 sheet. */}
            {/* No `uppercase` here - it used to carry the code, and it would
                now shout the unit as "CM" over the small-caps treatment. */}
            <div className="text-sm font-medium tracking-[0.03em]">
              {size.width_cm} × {size.height_cm} <span className="text-[9px]">cm</span>
            </div>
            <div className="mt-1 text-xs font-semibold">{formatINR(size.price_inr)}</div>
          </button>
        );
      })}
    </div>
  );
}
