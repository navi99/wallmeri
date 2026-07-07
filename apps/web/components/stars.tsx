"use client";

import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export function Stars({
  rating,
  count,
  size = "sm",
  className,
}: {
  rating: number;
  count?: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const px = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              px,
              i <= Math.round(rating)
                ? "fill-amber-400 text-amber-400"
                : "fill-brand-100 text-brand-100",
            )}
          />
        ))}
      </span>
      {count !== undefined && (
        <span className="text-xs text-muted">
          {rating.toFixed(1)} ({count})
        </span>
      )}
    </span>
  );
}

export function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} star${i > 1 ? "s" : ""}`}
          onClick={() => onChange(i)}
          className="rounded p-0.5 hover:scale-110"
        >
          <Star
            className={cn(
              "h-7 w-7 transition-colors",
              i <= value ? "fill-amber-400 text-amber-400" : "fill-brand-100 text-brand-200",
            )}
          />
        </button>
      ))}
    </div>
  );
}
