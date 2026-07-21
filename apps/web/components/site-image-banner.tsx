"use client";

import Image from "@/components/app-image";
import { useEffect, useState } from "react";

import { pickSlot, useSiteImages } from "@/lib/site-images";

// Self-fetching crossfade for the "home_hero" slot — however many images an
// admin has attached, cycling every 4s. Empty (still loading, or admin
// cleared every slide) falls back to a plain Noir panel rather than a broken
// hero; the surrounding frame markup (border, shadow) stays in the page.
export function HomeHeroSlideshow() {
  const { data } = useSiteImages();
  const slides = pickSlot(data, "home_hero");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 4000);
    return () => clearInterval(id);
  }, [slides.length]);

  if (slides.length === 0) {
    return <div className="h-full w-full bg-ink" />;
  }

  return (
    <>
      {slides.map((slide, i) => (
        <Image
          key={slide.id}
          src={slide.image_url}
          alt={slide.alt_text}
          fill
          priority={i === 0}
          sizes="(max-width: 640px) 90vw, 400px"
          className="object-cover transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === index ? 1 : 0 }}
        />
      ))}
    </>
  );
}

// Self-fetching single image for a slot capped at one image ("home_why_wallmeri",
// "about_hero"). Renders nothing but the fill content — caller owns the
// aspect-ratio/frame wrapper, same contract as HomeHeroSlideshow.
export function SingleSiteImage({
  slot,
  sizes,
  priority,
  emptyClassName = "bg-ink",
}: {
  slot: string;
  sizes: string;
  priority?: boolean;
  emptyClassName?: string;
}) {
  const { data } = useSiteImages();
  const image = pickSlot(data, slot)[0];

  if (!image) {
    return <div className={`h-full w-full ${emptyClassName}`} />;
  }

  return (
    <Image
      src={image.image_url}
      alt={image.alt_text}
      fill
      priority={priority}
      sizes={sizes}
      className="object-cover"
    />
  );
}
