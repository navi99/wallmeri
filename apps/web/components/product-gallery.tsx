"use client";

import Image from "@/components/app-image";
import { useState } from "react";

import type { ProductImage } from "@/lib/types";

// Alt text is auto-generated: the main image just gets the product title;
// every image after it is labelled "view N" so screen readers can tell them
// apart without admin data entry per image.
function altFor(title: string, index: number): string {
  return index === 0 ? title : `${title} — view ${index + 1}`;
}

const THUMB_BASE =
  "relative aspect-[3/4] flex-none overflow-hidden border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

export function ProductGallery({
  images,
  fallbackImageUrl,
  title,
}: {
  images: ProductImage[];
  fallbackImageUrl: string;
  title: string;
}) {
  const [active, setActive] = useState(0);

  // No managed gallery (legacy pasted URL / seeded product) — render exactly
  // like the old single-image layout, no rail or strip.
  if (images.length === 0) {
    return (
      <div className="relative aspect-[3/4] overflow-hidden border border-brand-100 bg-brand-50">
        <Image
          src={fallbackImageUrl}
          alt={title}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>
    );
  }

  const activeIndex = Math.min(active, images.length - 1);
  const current = images[activeIndex];

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:gap-4">
      {/* Desktop: vertical thumbnail rail */}
      <div className="hidden lg:flex lg:w-20 lg:flex-none lg:flex-col lg:gap-2 lg:overflow-y-auto">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Show image ${i + 1} of ${images.length}`}
            aria-current={i === activeIndex}
            className={`${THUMB_BASE} w-full ${
              i === activeIndex ? "border-ink" : "border-brand-100 hover:border-ink/40"
            }`}
          >
            <Image src={img.thumb_url} alt={altFor(title, i)} fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div className="relative aspect-[3/4] flex-1 overflow-hidden border border-brand-100 bg-brand-50">
        <Image
          src={current.image_url}
          alt={altFor(title, activeIndex)}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          priority={activeIndex === 0}
        />
      </div>

      {/* Mobile: static main image above + scrollable thumbnail strip */}
      <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Show image ${i + 1} of ${images.length}`}
            aria-current={i === activeIndex}
            className={`${THUMB_BASE} w-16 ${i === activeIndex ? "border-ink" : "border-brand-100"}`}
          >
            <Image src={img.thumb_url} alt={altFor(title, i)} fill sizes="64px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
