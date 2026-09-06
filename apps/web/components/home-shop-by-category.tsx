"use client";

import Image from "@/components/app-image";
import { useQuery } from "@tanstack/react-query";

import {
  fullRowCount,
  MediaRail,
  MediaRailItem,
  MediaRailSkeleton,
  railCols,
  railLabel,
} from "@/components/custom/media-rail";
import { api } from "@/lib/api";

// A category without an admin-set display poster gets a deterministic
// gradient from this palette (cycled by index) rather than a generic text
// box - keeps the grid feeling like art, not a filter list.
const tileGradients = [
  "linear-gradient(180deg,#4a4340 0%,#241f1e 100%)",
  "linear-gradient(160deg,#b32624 0%,#2e0503 100%)",
  "linear-gradient(170deg,#43312c 0%,#1c1514 100%)",
  "linear-gradient(140deg,#1b1717 0%,#1b1717 60%,#5b0a06 100%)",
  "linear-gradient(200deg,#3a3230 0%,#1b1717 100%)",
];

// Up to 4-up grid (matches Featured Pieces' tile width via maxTrack below) -
// wraps into additional rows on its own once there are more than 4 active
// categories, rather than stretching every category into one wide row.
const maxTrack = 380;

export function ShopByCategory() {
  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.listCategories(),
  });

  const active = (data ?? []).filter((c) => c.is_active !== false);
  const categories = active.slice(0, fullRowCount(active.length));

  if (isLoading)
    return (
      <MediaRailSkeleton count={4} cols="md:grid-cols-4" maxTrack={maxTrack} />
    );
  if (categories.length === 0) return null;

  const cols = railCols(categories.length);

  return (
    <MediaRail cols={cols} count={Math.min(categories.length, 4)} maxTrack={maxTrack}>
      {categories.map((c, i) => (
        <MediaRailItem
          key={c.id}
          href={`/category/${c.slug}`}
          media={
            c.poster_image_url ? (
              <Image
                src={c.poster_image_url}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 20vw"
              />
            ) : (
              <div
                className="h-full w-full"
                style={{ background: tileGradients[i % tileGradients.length] }}
              />
            )
          }
        >
          <span className={railLabel}>{c.name}</span>
        </MediaRailItem>
      ))}
    </MediaRail>
  );
}
