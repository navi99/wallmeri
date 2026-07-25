"use client";

import Image from "@/components/app-image";
import { useQuery } from "@tanstack/react-query";

import {
  MediaRail,
  MediaRailItem,
  MediaRailSkeleton,
  railLabel,
} from "@/components/custom/media-rail";
import { Stars } from "@/components/stars";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/utils";

const cols = "md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]";
const maxTrack = 380;

// Artwork tiles hold the 3:4 ratio the art is shot at, so a featured piece is
// never cropped at the usual five-across width. The max-height is only a
// guard: with two or three featured pieces the tracks get wide enough that a
// true 3:4 tile would run past a full screen, so the frame stops growing and
// crops horizontally instead.
const frame = "aspect-[3/4] max-h-[clamp(360px,42vw,560px)] bg-ink";

export function FeaturedProducts() {
  // Shares the ["products", ...] cache shape with the catalog page.
  const { data, isLoading } = useQuery({
    queryKey: ["products", { featured: "true", page_size: 5 }],
    queryFn: () =>
      api.listProducts({ featured: "true", sort: "newest", page: 1, page_size: 5 }),
  });

  const products = data?.items ?? [];

  if (isLoading)
    return (
      <MediaRailSkeleton
        count={5}
        cols={cols}
        maxTrack={maxTrack}
        frameClassName={frame}
      />
    );
  if (products.length === 0) return null;

  return (
    <MediaRail cols={cols} count={products.length} maxTrack={maxTrack}>
      {products.map((p) => (
        <MediaRailItem
          key={p.id}
          href={`/product/${p.slug}`}
          frameClassName={frame}
          media={
            <Image
              src={p.image_url}
              alt={p.title}
              fill
              sizes="(max-width: 768px) 68vw, 20vw"
              className="object-cover"
            />
          }
        >
          {/* Plaque: title and price share a baseline row, byline beneath in
              Warm Grey — the frameless product card from DESIGN.md §5, now
              sitting directly on the Cotton wall with no card behind it. */}
          <div className="flex items-baseline justify-between gap-2.5">
            <h3 className={`line-clamp-1 ${railLabel}`}>{p.title}</h3>
            <span className="shrink-0 text-sm font-normal tracking-[0.03em] text-premium-600">
              {formatINR(p.price_inr)}
            </span>
          </div>
          <p className="line-clamp-1 text-xs text-muted">
            {p.artist
              ? `by ${p.artist.name}`
              : (p.categories[0]?.name ?? "Metal Art")}
          </p>
          {p.rating_count > 0 && (
            <Stars
              rating={p.rating_avg ?? 0}
              count={p.rating_count}
              className="mt-0.5"
            />
          )}
        </MediaRailItem>
      ))}
    </MediaRail>
  );
}
