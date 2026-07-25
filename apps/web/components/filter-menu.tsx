"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import type { FilterOption } from "@/components/catalog-filter-rail";
import { cn } from "@/lib/utils";

/**
 * The listing-page toolbar control: a facet as a compact dropdown, for the
 * choices that sit above the grid (Category top-left, Sort top-right) rather
 * than in the left rail. Single-select like the rail's facets — one `category`
 * or one `sort` goes to the API — so this is a listbox, not a set of toggles.
 *
 * Options carrying `href` navigate (category pages); the rest call `onSelect`.
 */
export function FilterMenu({
  label,
  options,
  selected,
  onSelect,
  align = "start",
  className,
}: {
  /** Sits ahead of the current value on the trigger: "Sort — Newest". */
  label: string;
  options: FilterOption[];
  /** "" selects the leading "All …" option. */
  selected: string;
  onSelect?: (value: string) => void;
  /** Which edge the panel hangs from — `end` for a right-aligned trigger. */
  align?: "start" | "end";
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const optionRefs = React.useRef<(HTMLElement | null)[]>([]);

  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === selected),
  );
  const current = options[selectedIndex]?.label ?? "";

  // Pointer-down rather than click: closes before the outside target reacts,
  // so a click on the other menu's trigger opens it in the same gesture.
  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const close = (focusTrigger = true) => {
    setOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  };

  const focusOption = (index: number) => {
    const bounded = (index + options.length) % options.length;
    optionRefs.current[bounded]?.focus();
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            setOpen(true);
            // The panel mounts in this same commit; focus after paint.
            requestAnimationFrame(() =>
              focusOption(e.key === "ArrowDown" ? selectedIndex : selectedIndex - 1),
            );
          }
        }}
        className="label flex h-12 w-full items-center justify-between gap-3 border border-line px-4 text-ink transition-colors hover:border-ink sm:w-auto"
      >
        <span className="inline-flex items-baseline gap-2 truncate">
          <span className="text-muted">{label}</span>
          <span className="truncate">{current}</span>
        </span>
        <ChevronDown
          aria-hidden
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform duration-200 motion-reduce:transition-none",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={label}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              close();
            } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              const from = optionRefs.current.indexOf(
                document.activeElement as HTMLElement,
              );
              focusOption(from + (e.key === "ArrowDown" ? 1 : -1));
            } else if (e.key === "Home" || e.key === "End") {
              e.preventDefault();
              focusOption(e.key === "Home" ? 0 : options.length - 1);
            } else if (e.key === "Tab") {
              close(false);
            }
          }}
          className={cn(
            "absolute z-30 mt-1 max-h-72 min-w-full overflow-y-auto border border-line bg-cream py-1 shadow-[0_12px_32px_rgba(27,23,23,0.10)]",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          {options.map((option, index) => {
            const isSelected = index === selectedIndex;
            const body = (
              <>
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {option.count !== undefined && (
                  <span className="shrink-0 tabular-nums text-muted">
                    {option.count}
                  </span>
                )}
              </>
            );
            const className = cn(
              "flex w-full items-center gap-3 whitespace-nowrap px-4 py-2.5 text-left text-sm leading-5 transition-colors hover:bg-paper focus-visible:bg-paper focus:outline-none",
              isSelected ? "font-medium text-ink" : "text-muted",
            );
            const ref = (el: HTMLElement | null) => {
              optionRefs.current[index] = el;
            };

            return (
              <li key={option.value || "__all"} role="none">
                {option.href ? (
                  <Link
                    href={option.href}
                    ref={ref}
                    role="option"
                    aria-selected={isSelected}
                    className={className}
                  >
                    {body}
                  </Link>
                ) : (
                  <button
                    ref={ref}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onSelect?.(option.value);
                      close();
                    }}
                    className={className}
                  >
                    {body}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
