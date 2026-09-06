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

// Up to 4-up grid, wraps into extra rows past 4 artists - matches the Shop
// by Category and Featured Pieces grids above it.
const maxTrack = 380;

// Same frame as the featured-pieces rail above: 3:4 with a max-height guard, so
// a portrait and an artwork tile sit at identical size on the two light bands.
// Faces are the subject here, so the crop anchors to the top of the frame - a
// centred 3:4 cover clips foreheads on tight headshots.
const frame = "aspect-[3/4] max-h-[clamp(360px,42vw,560px)] bg-ink";

export function FeaturedArtists() {
  const { data, isLoading } = useQuery({
    queryKey: ["artists"],
    queryFn: () => api.listArtists(),
  });

  const ranked = [...(data ?? [])].sort(
    (a, b) => b.product_count - a.product_count,
  );
  const artists = ranked.slice(0, fullRowCount(ranked.length));

  if (isLoading)
    return (
      <MediaRailSkeleton
        count={4}
        cols="md:grid-cols-4"
        maxTrack={maxTrack}
        frameClassName={frame}
      />
    );

  if (artists.length === 0) {
    return (
      <p className="container-page text-base leading-[1.7] text-muted">
        Our first artists are being onboarded - check back soon.
      </p>
    );
  }

  const cols = railCols(artists.length);

  return (
    <MediaRail cols={cols} count={Math.min(artists.length, 4)} maxTrack={maxTrack}>
      {artists.map((a) => (
        <MediaRailItem
          key={a.id}
          href={`/artist/${a.slug}`}
          frameClassName={frame}
          media={
            a.avatar_url ? (
              <Image
                src={a.avatar_url}
                alt={a.name}
                fill
                sizes="(max-width: 768px) 50vw, 20vw"
                className="object-cover object-top"
              />
            ) : (
              // An artist still awaiting a portrait gets their initial as an
              // engraved monogram on the same Noir plate the frame already
              // carries - a bare plate reads as a hole in the row.
              <div className="flex h-full w-full items-center justify-center">
                <span className="font-display text-6xl italic text-cream/20">
                  {a.name.trim().charAt(0)}
                </span>
              </div>
            )
          }
        >
          {/* Same plaque voice as the featured-pieces tiles beside it, now on
              the light wall - the two bands read as one gallery run. */}
          <div className={railLabel}>{a.name}</div>
        </MediaRailItem>
      ))}
    </MediaRail>
  );
}
