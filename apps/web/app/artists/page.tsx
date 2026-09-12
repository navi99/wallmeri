"use client";

import { Suspense } from "react";
import Image from "@/components/app-image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { hungPrint, railLabel } from "@/components/custom/media-rail";
import { FilterMenu } from "@/components/filter-menu";
import { Spinner } from "@/components/ui";
import { api } from "@/lib/api";
import type { Artist } from "@/lib/types";

// The roster has no server-side facets - /artists returns everyone - so the
// page carries sort only, applied client-side but still URL-driven so a sorted
// roster stays linkable like the Gallery's filters.
const SORT_OPTIONS = [
  { value: "pieces", label: "Most pieces" },
  { value: "name", label: "Name: A–Z" },
];

function sortArtists(artists: Artist[], sort: string): Artist[] {
  const next = [...artists];
  if (sort === "name") return next.sort((a, b) => a.name.localeCompare(b.name));
  return next.sort(
    (a, b) => b.product_count - a.product_count || a.name.localeCompare(b.name),
  );
}

function ArtistsContent() {
  const router = useRouter();
  const params = useSearchParams();
  const sort = params.get("sort") ?? "pieces";

  const artistsQuery = useQuery({
    queryKey: ["artists"],
    queryFn: () => api.listArtists(),
  });

  const artists = artistsQuery.data ? sortArtists(artistsQuery.data, sort) : [];

  return (
    <div className="container-page py-12 lg:py-16">
      <nav
        aria-label="Breadcrumb"
        className="label text-xs text-muted"
      >
        <Link href="/" className="transition-colors hover:text-brand-600">
          Home
        </Link>
        <span aria-hidden className="px-2 text-muted">
          /
        </span>
        <span className="text-ink">Artists</span>
      </nav>

      <div className="mt-5 border-b border-line pb-6">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
          <h1 className="title-lg">
            Our Artists
          </h1>
          <p className="label text-xs text-muted">
            {artistsQuery.data
              ? `${artists.length} ${artists.length === 1 ? "artist" : "artists"}`
              : "Loading…"}
          </p>
        </div>
        <p className="mt-4 max-w-[65ch] text-sm leading-relaxed text-muted">
          Every WallMeri artist is hand-picked and verified by our team. Browse their
          collections and bring their work to your walls.
        </p>
      </div>

      {/* Sort is the roster's only control, so it sits alone at the top right
          rather than holding open a rail beside the grid. */}
      <div className="mt-6 flex justify-end">
        <FilterMenu
          label="Sort"
          options={SORT_OPTIONS}
          selected={sort}
          align="end"
          onSelect={(value) => router.push(`/artists?sort=${value}`)}
        />
      </div>

      <div className="mt-8">
        {artistsQuery.isLoading ? (
          <div className="grid place-items-center py-24">
            <Spinner />
          </div>
        ) : artists.length === 0 ? (
          <div className="border border-line bg-paper p-12 text-center">
            <p className="title-xs">
              No artists yet
            </p>
            <p className="mt-2 text-sm text-muted">
              Our first artists are being onboarded - check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:gap-x-8 sm:gap-y-14 lg:grid-cols-4">
            {artists.map((a) => (
              <ArtistTile key={a.id} artist={a} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-16 flex flex-col items-start gap-5 border border-line bg-paper px-8 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="title-xs">
            Are you an artist?
          </h2>
          <p className="mt-2 text-sm text-muted">
            We handle printing, sales and shipping - you focus on the art.
          </p>
        </div>
        <Link
          href="/artists/join"
          className="label inline-flex h-12 shrink-0 items-center justify-center bg-ink px-6 text-cream transition-colors hover:bg-brand-600 active:bg-brand-700"
        >
          Apply to join
        </Link>
      </div>
    </div>
  );
}

/**
 * Square portrait with the name set on the Cotton beneath it - the homepage
 * tile-rail language (hung-print frame, media-only hover zoom, tracked label
 * plaque), squared off and dropped into a grid.
 */
function ArtistTile({ artist }: { artist: Artist }) {
  return (
    <Link href={`/artist/${artist.slug}`} className="group flex flex-col">
      {/* The tint backs the frame so a slow or missing portrait still reads as
          a tile rather than a hole in the grid - ProductCard does the same
          with bg-ink behind artwork. */}
      <div className={`relative aspect-square overflow-hidden bg-ink/5 ${hungPrint}`}>
        {/* The zoom lives on the media, never the tile - the cut edges stay put. */}
        <div className="absolute inset-0 transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100">
          {artist.avatar_url ? (
            <Image
              src={artist.avatar_url}
              alt={artist.name}
              fill
              sizes="(max-width: 1024px) 50vw, 25vw"
              className="object-cover"
            />
          ) : (
            // Awaiting a portrait: the initial as an engraved monogram, so the
            // tile still reads as a piece rather than a hole in the grid.
            <div className="flex h-full w-full items-center justify-center bg-ink/5">
              <span className="font-display text-6xl italic text-muted">
                {artist.name.trim().charAt(0)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-1.5">
        {/* Truncates to one line past whatever width the tile has - the
            native title attribute surfaces the full name on hover rather
            than wrapping the tile taller for a rare long name. */}
        <div className={`${railLabel} truncate`} title={artist.name}>
          {artist.name}
        </div>
        {artist.bio && (
          <p className="mt-1 text-center text-sm leading-relaxed text-muted">
            {artist.bio}
          </p>
        )}
      </div>
    </Link>
  );
}

export default function ArtistsPage() {
  return (
    <Suspense
      fallback={
        <div className="container-page py-24 text-center">
          <Spinner />
        </div>
      }
    >
      <ArtistsContent />
    </Suspense>
  );
}
