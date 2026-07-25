"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

/** Mirrors the `sort` values the catalog API accepts (see routes/catalog.py). */
export const SORT_OPTIONS: FilterOption[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "title", label: "Name: A–Z" },
];

export type FilterOption = {
  value: string;
  label: string;
  count?: number;
  /** When set the choice navigates instead of calling `onSelect` (category pages). */
  href?: string;
};

export type FilterSection = {
  id: string;
  label: string;
  options: FilterOption[];
  /** "" means nothing in this section is applied. */
  selected: string;
  onSelect?: (value: string) => void;
  defaultOpen?: boolean;
  /** Re-clicking the applied choice clears it. Off for Sort, which is always set. */
  clearable?: boolean;
  /** Caps the list height and scrolls — for long facets like Artist. */
  scroll?: boolean;
};

/**
 * The listing-page filter column: a sticky left rail on `lg+`, a disclosure
 * above the grid below it. Facets are single-select because the catalog API
 * takes one `category` and one `artist` slug — the square indicators read as
 * checkboxes but behave as a toggle, so `aria-pressed` (not radio) is the
 * honest semantic.
 */
export function FilterRail({
  sections,
  activeCount,
  clearHref,
  title = "Filter",
  mobileLabel = "Filter & Sort",
  children,
}: {
  sections: FilterSection[];
  activeCount: number;
  clearHref: string;
  /** Rail header on `lg+`. Pass null on a single-section rail, where the
   *  header would just repeat that section's own label. */
  title?: string | null;
  mobileLabel?: string;
  children?: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="lg:sticky lg:top-[88px]">
      <button
        type="button"
        onClick={() => setMobileOpen((o) => !o)}
        aria-expanded={mobileOpen}
        aria-controls="filter-rail"
        className="label flex w-full items-center justify-between border-y border-line py-3.5 text-ink lg:hidden"
      >
        <span className="inline-flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {mobileLabel}
          {activeCount > 0 && <span className="text-brand-600">({activeCount})</span>}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200 motion-reduce:transition-none",
            mobileOpen && "rotate-180",
          )}
        />
      </button>

      <div id="filter-rail" className={cn("lg:block", mobileOpen ? "block" : "hidden")}>
        {(title || activeCount > 0) && (
          <div
            className={cn(
              "hidden items-baseline border-b border-line pb-3 lg:flex",
              title ? "justify-between" : "justify-end",
            )}
          >
            {title && (
              <span className="label text-ink">
                {title}
              </span>
            )}
            {activeCount > 0 && <ClearLink href={clearHref} />}
          </div>
        )}

        {sections.map((section) => (
          <FilterDisclosure key={section.id} section={section} />
        ))}

        {activeCount > 0 && (
          <div className="pt-4 lg:hidden">
            <ClearLink href={clearHref} />
          </div>
        )}

        {children}
      </div>
    </div>
  );
}

function ClearLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="label text-[12px] text-brand-600 hover:underline"
    >
      Clear all
    </Link>
  );
}

function FilterDisclosure({ section }: { section: FilterSection }) {
  const [open, setOpen] = React.useState(section.defaultOpen ?? true);
  const contentId = `filter-${section.id}`;

  return (
    <div className="border-b border-line">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={contentId}
        className="label flex w-full items-center justify-between gap-3 py-4 text-left text-ink transition-colors hover:text-brand-600"
      >
        {section.label}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform duration-200 motion-reduce:transition-none",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <ul
          id={contentId}
          className={cn(
            "space-y-2.5 pb-5",
            section.scroll && "max-h-64 overflow-y-auto pr-1",
          )}
        >
          {section.options.map((option) => (
            <li key={option.value || "__all"}>
              <FilterChoice
                option={option}
                selected={section.selected === option.value}
                clearable={section.clearable ?? true}
                onSelect={section.onSelect}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChoice({
  option,
  selected,
  clearable,
  onSelect,
}: {
  option: FilterOption;
  selected: boolean;
  clearable: boolean;
  onSelect?: (value: string) => void;
}) {
  const className = cn(
    "group flex w-full items-start gap-2.5 text-left text-sm leading-5 transition-colors",
    selected ? "font-medium text-ink" : "text-muted hover:text-ink",
  );

  const body = (
    <>
      <span
        aria-hidden
        className={cn(
          "mt-0.5 h-3.5 w-3.5 shrink-0 border transition-colors",
          selected ? "border-ink bg-ink" : "border-line group-hover:border-ink",
        )}
      />
      <span className="min-w-0 flex-1 truncate">{option.label}</span>
      {option.count !== undefined && (
        <span className="shrink-0 tabular-nums text-muted">{option.count}</span>
      )}
    </>
  );

  if (option.href) {
    return (
      <Link
        href={option.href}
        className={className}
        aria-current={selected ? "true" : undefined}
      >
        {body}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect?.(selected && clearable ? "" : option.value)}
      className={className}
    >
      {body}
    </button>
  );
}
