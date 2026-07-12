"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { Card, Spinner } from "@/components/ui";
import { api } from "@/lib/api";

export default function ArtistsPage() {
  const artistsQuery = useQuery({
    queryKey: ["artists"],
    queryFn: () => api.listArtists(),
  });

  return (
    <div className="container-page py-8">
      <h1 className="text-3xl font-bold uppercase tracking-tight text-ink">Our artists</h1>
      <p className="mt-1 max-w-2xl text-muted">
        Every Wallmeri artist is hand-picked and verified by our team. Browse their
        collections and bring their work to your walls.
      </p>

      {artistsQuery.isLoading ? (
        <div className="grid place-items-center py-24">
          <Spinner />
        </div>
      ) : !artistsQuery.data || artistsQuery.data.length === 0 ? (
        <p className="mt-10 text-muted">Our first artists are being onboarded — check back soon.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {artistsQuery.data.map((a) => (
            <Link key={a.id} href={`/artist/${a.slug}`}>
              <Card className="flex h-full items-center gap-4 p-5 transition-shadow hover:shadow-lift">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-brand-50">
                  {a.avatar_url && (
                    <Image src={a.avatar_url} alt={a.name} fill sizes="64px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-ink">{a.name}</h2>
                  <p className="line-clamp-2 text-sm text-muted">{a.bio}</p>
                  <p className="mt-1 text-xs font-semibold text-brand-600">
                    {a.product_count} poster{a.product_count === 1 ? "" : "s"}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Card className="mt-12 flex flex-col items-start gap-3 bg-brand-50/50 p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">Are you an artist?</h2>
          <p className="mt-1 text-sm text-muted">
            We handle printing, sales and shipping — you focus on the art.
          </p>
        </div>
        <Link
          href="/artists/join"
          className="inline-flex h-11 items-center justify-center bg-ink px-6 text-xs font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-brand-600 active:bg-brand-700"
        >
          Apply to join
        </Link>
      </Card>
    </div>
  );
}
