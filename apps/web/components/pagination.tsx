"use client";

import { cn } from "@/lib/utils";

/** 1 … 4 5 6 … 20 - always the ends, always a neighbour on each side. */
function pageWindow(page: number, pages: number): (number | "gap")[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);

  const items: (number | "gap")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pages - 1, page + 1);

  if (start > 2) items.push("gap");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < pages - 1) items.push("gap");
  items.push(pages);

  return items;
}

export function Pagination({
  page,
  pages,
  onPage,
  className,
}: {
  page: number;
  pages: number;
  onPage: (page: number) => void;
  className?: string;
}) {
  if (pages <= 1) return null;

  const stepClass =
    "label px-3 text-ink transition-colors hover:text-brand-600 disabled:cursor-not-allowed disabled:text-line disabled:hover:text-line";

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "mt-16 flex items-center justify-center gap-1 border-t border-line pt-8",
        className,
      )}
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className={stepClass}
      >
        Prev
      </button>

      {pageWindow(page, pages).map((item, i) =>
        item === "gap" ? (
          <span key={`gap-${i}`} aria-hidden className="px-1 text-sm text-muted">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-current={item === page ? "page" : undefined}
            onClick={() => onPage(item)}
            className={cn(
              "h-10 min-w-[40px] px-1 text-sm font-normal tabular-nums tracking-[0.03em] transition-colors",
              item === page
                ? "bg-ink text-cream"
                : "text-muted hover:text-brand-600",
            )}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        disabled={page >= pages}
        onClick={() => onPage(page + 1)}
        className={stepClass}
      >
        Next
      </button>
    </nav>
  );
}
