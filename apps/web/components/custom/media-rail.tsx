"use client";

import Link from "next/link";
import type { ReactNode } from "react";

// The homepage tile rail (2026-07-25) - the shared geometry behind Shop by
// Category, Featured Pieces, and Featured Artists so the three bands read as
// one gallery wall instead of three different card treatments.
//
// Shape: a full-bleed row of art tiles separated by a hairline gutter, with
// the label set on the surface *beneath* the tile - no card behind the label,
// no chrome around the caption. The tile itself wears the hung-print frame
// (see `hungPrint` below, added 2026-09-12): a thin Noir bezel and a shadow
// thrown left and down, nothing else - plus a slight tilt on hover. The art is still the only thing on screen with weight,
// which is what DESIGN.md's art-first product-card rule asks for.
//
// Below `md` the same markup renders as a plain 2-up grid (grid-cols-2) that
// scrolls with the page, matching the Gallery/Category/Artists listing
// convention - no separate scroll mechanism for the row (updated 2026-09-06,
// replacing the earlier snap-scroll rail).

// Gutter and outer inset are the same value, so the row reads as an even
// rhythm running off both edges of the viewport.
const gutterValue = "clamp(8px,1vw,14px)";
const gutter = "gap-[clamp(8px,1vw,14px)] px-[clamp(8px,1vw,14px)]";

// A row of `count` tiles at `maxTrack` wide, plus the count+1 gutters between
// and either side of them. Used as a max-width so the rail bleeds edge to edge
// at a normal item count but stops stretching when there are only two or three
// items - otherwise a 3-artist row hands each tile 510px of width against a
// 440px frame and turns portraits into landscape crops.
function trackCap(count: number, maxTrack: number) {
  return `calc(${count} * ${maxTrack}px + ${count + 1} * ${gutterValue})`;
}

// Show only full rows of a fixed-column grid, e.g. 9-11 items at 4/row show
// 8, 5-7 show 4 - avoids a dangling partial row at the end. Fewer items than
// one row shows all of them.
export function fullRowCount(total: number, perRow = 4) {
  return total < perRow ? total : Math.floor(total / perRow) * perRow;
}

// Column class for an up-to-4-across grid: a full row gets exactly 4 columns
// (wrapping into extra rows past 4 items); a lone partial row (1-3 items,
// only possible when the source has fewer than 4 total) gets exactly that
// many columns so they stretch to fill the row like the old auto-fit rail,
// instead of leaving empty tracks. Literal keys so Tailwind's JIT scanner
// picks up every class name.
const partialRowCols: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
};
export function railCols(displayedCount: number) {
  return partialRowCols[displayedCount] ?? "md:grid-cols-4";
}

// Default frame: a fixed responsive height rather than an aspect ratio, so
// tile proportions stay gallery-like at any column count (a 3-artist row and
// a 6-category row get the same visual weight).
export const railFrame = "h-[clamp(300px,30vw,440px)]";

// The hung-print treatment (2026-09-12) - every art tile on the storefront
// grids and the homepage bands wears this, so a poster reads as a framed print
// hung on the wall rather than a plate cut flush into it:
//
//   - a 2px Noir bezel at the image edge - Noir Black, never #000 - reading
//     as the frame around the print (the `fill` media is positioned against
//     the padding box, so the border eats no layout),
//   - `shadow-frame`, thrown left and down the way a print casts under the
//     gallery's light,
//   - and, on hover only, a uniform 2deg clockwise tilt - same angle on every
//     card, never randomised per item. At rest every print hangs square; the
//     tilt is the interaction, a piece nudged off-level as you reach for it.
//
// The 0.97 scale that rides along with the tilt is not decoration: rotating a
// tile grows its bounding box by about h*sin(2deg) in width, which is wider
// than the rail's own gutter, so without it a tilted card's corners would
// collide with its neighbours. Shrinking by 3% holds the rotated box inside
// the original grid track, which is why no gutter, maxTrack or trackCap value
// had to move. `z-10` puts the tilted card above its neighbours regardless.
export const hungPrint =
  "border-2 border-ink shadow-frame " +
  "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] " +
  "group-hover:rotate-[2deg] group-hover:scale-[0.97] group-hover:z-10 " +
  "motion-reduce:transition-none motion-reduce:group-hover:rotate-0 " +
  "motion-reduce:group-hover:scale-100";

// Caption plaque. Every plaque holds a *name* - a product title, a category, an
// artist - not chrome, so it takes the same Title Case treatment as the product
// card's own title rather than the uppercase `.label` voice. That matters
// because the same product appears in both places: uppercase here and Title
// Case in the grid would be two treatments of one string. Warms to Premium Red
// on hover so the whole tile reads as one target.
export const railLabel =
  "text-center text-sm font-normal tracking-[0.03em] text-ink transition-colors duration-200 group-hover:text-premium-600";
export const railLabelOnDark =
  "text-center text-sm font-normal tracking-[0.03em] text-cream transition-colors duration-200 group-hover:text-premium-300";

export function MediaRail({
  cols,
  count,
  maxTrack,
  children,
}: {
  // Desktop column rule, e.g. `md:grid-cols-5` or an auto-fit template.
  cols: string;
  // Item count and widest a single tile may get - together they cap the row
  // (see trackCap). Omit both to let the rail always run edge to edge.
  count?: number;
  maxTrack?: number;
  children: ReactNode;
}) {
  return (
    <div
      className={`mx-auto grid grid-cols-2 ${cols} ${gutter}`}
      style={{
        ...(count && maxTrack
          ? { maxWidth: trackCap(count, maxTrack) }
          : null),
      }}
    >
      {children}
    </div>
  );
}

export function MediaRailItem({
  href,
  frameClassName = railFrame,
  media,
  children,
}: {
  href: string;
  // Sizing/background for the image frame - override to swap the default
  // fixed height for an aspect ratio (artwork tiles hold 3:4).
  frameClassName?: string;
  media: ReactNode;
  // The caption plaque beneath the tile.
  children: ReactNode;
}) {
  return (
    <Link href={href} className="group flex flex-col">
      <div className={`relative overflow-hidden ${hungPrint} ${frameClassName}`}>
        {/* The zoom lives on the media, never the tile: the cut edges of the
            frame stay exactly put (steel), only the art breathes. */}
        <div className="absolute inset-0 transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100">
          {media}
        </div>
      </div>
      <div className="mt-[clamp(12px,1.1vw,16px)] flex flex-col items-center gap-1">
        {children}
      </div>
    </Link>
  );
}

export function MediaRailSkeleton({
  count,
  cols,
  maxTrack,
  frameClassName = railFrame,
  tone = "light",
}: {
  count: number;
  cols: string;
  maxTrack?: number;
  frameClassName?: string;
  tone?: "light" | "dark";
}) {
  const fill = tone === "dark" ? "bg-cream/10" : "bg-ink/5";
  return (
    <MediaRail cols={cols} count={count} maxTrack={maxTrack}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col">
          <div className={`animate-pulse ${hungPrint} ${frameClassName} ${fill}`} />
          <div
            className={`mt-[clamp(12px,1.1vw,16px)] h-3 w-2/3 animate-pulse ${fill}`}
          />
        </div>
      ))}
    </MediaRail>
  );
}
