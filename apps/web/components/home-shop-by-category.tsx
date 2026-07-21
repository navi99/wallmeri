"use client";

import Image from "@/components/app-image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

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

export function ShopByCategory() {
  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.listCategories(),
  });

  const categories = (data ?? []).filter((c) => c.is_active !== false);

  if (!isLoading && categories.length === 0) return null;

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5">
      {isLoading
        ? Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[280px] animate-pulse bg-ink/5" />
          ))
        : categories.map((c, i) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className="group flex flex-col gap-3 transition-transform duration-300 hover:-translate-y-1.5"
            >
              {c.poster_image_url ? (
                <div className="relative h-[280px] overflow-hidden shadow-card transition-shadow duration-300 group-hover:shadow-lift">
                  <Image
                    src={c.poster_image_url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 20vw, 45vw"
                  />
                </div>
              ) : (
                <div
                  className="h-[280px] shadow-card transition-shadow duration-300 group-hover:shadow-lift"
                  style={{ background: tileGradients[i % tileGradients.length] }}
                />
              )}
              <span className="text-[15px] font-semibold uppercase tracking-[0.06em] text-ink">
                {c.name}
              </span>
            </Link>
          ))}
    </div>
  );
}
