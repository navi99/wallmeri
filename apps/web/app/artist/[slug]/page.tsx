"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Globe, Instagram } from "lucide-react";

import { ProductCard } from "@/components/product-card";
import { Spinner } from "@/components/ui";
import { api, ApiError } from "@/lib/api";

export default function ArtistPage({ params }: { params: { slug: string } }) {
  const artistQuery = useQuery({
    queryKey: ["artist", params.slug],
    queryFn: () => api.getArtist(params.slug),
    retry: false,
  });
  const productsQuery = useQuery({
    queryKey: ["artist-products", params.slug],
    queryFn: () => api.artistProducts(params.slug),
    enabled: !!artistQuery.data,
  });

  if (artistQuery.isLoading) {
    return (
      <div className="grid place-items-center py-32">
        <Spinner />
      </div>
    );
  }

  const artist = artistQuery.data;
  if (artistQuery.error || !artist) {
    const notFound = artistQuery.error instanceof ApiError && artistQuery.error.status === 404;
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl font-bold uppercase tracking-tight text-ink">
          {notFound ? "Artist not found" : "Something went wrong"}
        </h1>
        <Link href="/artists" className="mt-4 inline-block font-semibold text-brand-600 hover:underline">
          Browse all artists
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <Link
        href="/artists"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-brand-600"
      >
        <ChevronLeft className="h-4 w-4" /> All artists
      </Link>

      <div className="mt-6 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-white bg-brand-50 shadow-card">
          {artist.avatar_url && (
            <Image src={artist.avatar_url} alt={artist.name} fill sizes="112px" className="object-cover" />
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-ink">{artist.name}</h1>
          <p className="mt-2 max-w-2xl leading-relaxed text-muted">{artist.bio}</p>
          <div className="mt-3 flex gap-4 text-sm">
            {artist.website_url && (
              <a
                href={artist.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-semibold text-brand-600 hover:underline"
              >
                <Globe className="h-4 w-4" /> Website
              </a>
            )}
            {artist.instagram_url && (
              <a
                href={artist.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-semibold text-brand-600 hover:underline"
              >
                <Instagram className="h-4 w-4" /> Instagram
              </a>
            )}
          </div>
        </div>
      </div>

      <h2 className="mt-12 text-2xl font-bold text-ink">
        Posters by {artist.name}{" "}
        <span className="text-base font-medium text-muted">({artist.product_count})</span>
      </h2>
      {productsQuery.isLoading ? (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      ) : !productsQuery.data || productsQuery.data.length === 0 ? (
        <p className="mt-4 text-muted">New work coming soon.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {productsQuery.data.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
