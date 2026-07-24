"use client";

import Image from "@/components/app-image";
import { useEffect, useState } from "react";

import { pickSlot, useSiteImages } from "@/lib/site-images";

// Full-bleed homepage hero background: an admin-uploaded "home_hero_video"
// autoplays (muted/loop/playsInline) with the first "home_hero" image as its
// poster frame; reduced-motion users and sites with no video yet get that
// same image full-bleed instead. Empty falls back to a plain Noir panel.
export function HomeHeroMedia() {
  const { data } = useSiteImages();
  const images = pickSlot(data, "home_hero");
  const video = pickSlot(data, "home_hero_video")[0];
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  if (video && !reduceMotion) {
    return (
      <video
        autoPlay
        muted
        loop
        playsInline
        poster={images[0]?.image_url}
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={video.image_url} />
      </video>
    );
  }

  if (images.length === 0) {
    return <div className="absolute inset-0 bg-ink" />;
  }

  return (
    <Image
      src={images[0].image_url}
      alt={images[0].alt_text}
      fill
      priority
      sizes="100vw"
      className="object-cover"
    />
  );
}

// Self-fetching single image for a slot capped at one image ("home_why_wallmeri",
// "about_hero"). Renders nothing but the fill content — caller owns the
// aspect-ratio/frame wrapper, same contract as HomeHeroMedia.
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
