"use client";

import Image from "@/components/app-image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

export function FeaturedArtists() {
  const { data, isLoading } = useQuery({
    queryKey: ["artists"],
    queryFn: () => api.listArtists(),
  });

  const artists = [...(data ?? [])]
    .sort((a, b) => b.product_count - a.product_count)
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-full bg-cream/10" />
        ))}
      </div>
    );
  }

  if (artists.length === 0) {
    return (
      <p className="text-base leading-[1.7] text-cream/60">
        Our first artists are being onboarded — check back soon.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
      {artists.map((a) => (
        <Link
          key={a.id}
          href={`/artist/${a.slug}`}
          className="group flex flex-col items-center gap-4 text-center transition-opacity hover:opacity-90"
        >
          <div className="relative aspect-square w-full overflow-hidden rounded-full bg-cream/10">
            {a.avatar_url && (
              <Image
                src={a.avatar_url}
                alt={a.name}
                fill
                sizes="(max-width: 640px) 45vw, 220px"
                className="object-cover"
              />
            )}
          </div>
          <div>
            <div className="font-display text-lg italic text-cream">{a.name}</div>
            <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-cream/50">
              {a.product_count} {a.product_count === 1 ? "piece" : "pieces"}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
