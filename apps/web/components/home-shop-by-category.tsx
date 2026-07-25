"use client";

import Image from "@/components/app-image";
import { useQuery } from "@tanstack/react-query";

import {
  MediaRail,
  MediaRailItem,
  MediaRailSkeleton,
  railLabel,
} from "@/components/custom/media-rail";
import { api } from "@/lib/api";

// A category without an admin-set display poster gets a deterministic
// gradient from this palette (cycled by index) rather than a generic text
// box — keeps the grid feeling like art, not a filter list.
const tileGradients = [
  "linear-gradient(180deg,#4a4340 0%,#241f1e 100%)",
  "linear-gradient(160deg,#b32624 0%,#2e0503 100%)",
  "linear-gradient(170deg,#43312c 0%,#1c1514 100%)",
  "linear-gradient(140deg,#1b1717 0%,#1b1717 60%,#5b0a06 100%)",
  "linear-gradient(200deg,#3a3230 0%,#1b1717 100%)",
];

// auto-fit + 1fr: however many categories the admin has active, they stretch
// to fill one edge-to-edge row (empty tracks collapse), so the row always
// reads as a continuous gallery wall rather than a ragged grid.
const cols = "md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]";
const maxTrack = 440;

export function ShopByCategory() {
  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.listCategories(),
  });

  const categories = (data ?? []).filter((c) => c.is_active !== false);

  if (isLoading)
    return <MediaRailSkeleton count={5} cols={cols} maxTrack={maxTrack} />;
  if (categories.length === 0) return null;

  return (
    <MediaRail cols={cols} count={categories.length} maxTrack={maxTrack}>
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
                sizes="(max-width: 768px) 68vw, 20vw"
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
