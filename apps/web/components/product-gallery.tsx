"use client";

import Image from "@/components/app-image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react";

import type { ProductImage } from "@/lib/types";

// Alt text is auto-generated: the main image just gets the product title;
// every image after it is labelled "view N" so screen readers can tell them
// apart without admin data entry per image.
function altFor(title: string, index: number): string {
  return index === 0 ? title : `${title} — view ${index + 1}`;
}

const THUMB_BASE =
  "relative aspect-[3/4] flex-none overflow-hidden border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

const HOVER_ZOOM = 2;
const MAX_PINCH_ZOOM = 2.5;

function touchDistance(a: React.Touch, b: React.Touch): number {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

// Wraps a single slide's image with two independent zoom interactions:
// desktop mouse-hover magnify (scale from cursor position, no pan math
// needed) and mobile pinch-to-zoom + single-finger pan once zoomed. Touch
// starts at scale 1 stay "pan-x" so the carousel's native swipe-between-
// images gesture is untouched; only once zoomed do we take over the finger.
function ZoomableSlide({
  src,
  alt,
  isActive,
  priority,
}: {
  src: string;
  alt: string;
  isActive: boolean;
  priority: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverOrigin, setHoverOrigin] = useState<{ x: number; y: number } | null>(null);
  const [pinch, setPinch] = useState({ scale: 1, tx: 0, ty: 0 });
  const gesture = useRef<{
    mode: "pinch" | "pan" | "none";
    startDist: number;
    startScale: number;
    startTx: number;
    startTy: number;
    lastX: number;
    lastY: number;
  }>({ mode: "none", startDist: 0, startScale: 1, startTx: 0, startTy: 0, lastX: 0, lastY: 0 });

  // Leaving the slide (swiped away) resets any in-progress zoom so it
  // doesn't come back pre-zoomed when the user swipes back to it.
  useEffect(() => {
    if (!isActive) {
      setPinch({ scale: 1, tx: 0, ty: 0 });
      setHoverOrigin(null);
    }
  }, [isActive]);

  const clamp = (tx: number, ty: number, scale: number) => {
    const el = containerRef.current;
    const maxX = el ? (el.clientWidth * (scale - 1)) / 2 : 0;
    const maxY = el ? (el.clientHeight * (scale - 1)) / 2 : 0;
    return {
      tx: Math.min(maxX, Math.max(-maxX, tx)),
      ty: Math.min(maxY, Math.max(-maxY, ty)),
    };
  };

  const onMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverOrigin({
      x: Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)),
      y: Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100)),
    });
  };

  // No e.preventDefault() here: React's root touchstart/touchmove listeners
  // are passive, so calling it would only log a console warning and do
  // nothing. Native scroll/pinch is instead blocked declaratively via the
  // touch-action style below (pan-x normally, none while zoomed).
  const onTouchStart = (e: ReactTouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      gesture.current = {
        mode: "pinch",
        startDist: touchDistance(e.touches[0], e.touches[1]),
        startScale: pinch.scale,
        startTx: pinch.tx,
        startTy: pinch.ty,
        lastX: 0,
        lastY: 0,
      };
    } else if (e.touches.length === 1 && pinch.scale > 1) {
      gesture.current.mode = "pan";
      gesture.current.lastX = e.touches[0].clientX;
      gesture.current.lastY = e.touches[0].clientY;
    }
  };

  const onTouchMove = (e: ReactTouchEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (g.mode === "pinch" && e.touches.length === 2) {
      const dist = touchDistance(e.touches[0], e.touches[1]);
      const scale = Math.min(MAX_PINCH_ZOOM, Math.max(1, g.startScale * (dist / g.startDist)));
      setPinch({ ...clamp(g.startTx, g.startTy, scale), scale });
    } else if (g.mode === "pan" && e.touches.length === 1) {
      const dx = e.touches[0].clientX - g.lastX;
      const dy = e.touches[0].clientY - g.lastY;
      g.lastX = e.touches[0].clientX;
      g.lastY = e.touches[0].clientY;
      setPinch((prev) => ({ ...clamp(prev.tx + dx, prev.ty + dy, prev.scale), scale: prev.scale }));
    }
  };

  const onTouchEnd = (e: ReactTouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0) {
      gesture.current.mode = "none";
      if (pinch.scale <= 1) setPinch({ scale: 1, tx: 0, ty: 0 });
    } else if (e.touches.length === 1) {
      // Dropped from two fingers to one mid-pinch: keep zoom, switch to pan.
      gesture.current.mode = pinch.scale > 1 ? "pan" : "none";
      gesture.current.lastX = e.touches[0].clientX;
      gesture.current.lastY = e.touches[0].clientY;
    }
  };

  const zoomed = pinch.scale > 1;
  const style: React.CSSProperties = zoomed
    ? {
        transform: `translate(${pinch.tx}px, ${pinch.ty}px) scale(${pinch.scale})`,
        transformOrigin: "center center",
        touchAction: "none",
      }
    : hoverOrigin
      ? {
          transform: `scale(${HOVER_ZOOM})`,
          transformOrigin: `${hoverOrigin.x}% ${hoverOrigin.y}%`,
          touchAction: "pan-x",
        }
      : { touchAction: "pan-x" };

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden"
      onMouseMove={onMouseMove}
      onMouseLeave={() => setHoverOrigin(null)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover"
        style={style}
        priority={priority}
      />
    </div>
  );
}

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
  const trackRef = useRef<HTMLDivElement>(null);
  // Suppresses the scroll listener while we're driving the scroll
  // programmatically (thumbnail/arrow click), so it doesn't fight the
  // in-flight smooth-scroll and briefly report the wrong active index.
  const scrollingFromControl = useRef(false);

  // No managed gallery (legacy pasted URL / seeded product) — render exactly
  // like the old single-image layout, no rail, strip, or carousel.
  if (images.length === 0) {
    return (
      <div className="relative aspect-[3/4] overflow-hidden border border-brand-100 bg-brand-50">
        <ZoomableSlide src={fallbackImageUrl} alt={title} isActive priority />
      </div>
    );
  }

  const activeIndex = Math.min(active, images.length - 1);

  const scrollToIndex = (index: number) => {
    const track = trackRef.current;
    const slide = track?.children[index];
    if (!track || !(slide instanceof HTMLElement)) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scrollingFromControl.current = true;
    track.scrollTo({ left: slide.offsetLeft, behavior: reduced ? "auto" : "smooth" });
    setActive(index);
    window.setTimeout(() => {
      scrollingFromControl.current = false;
    }, reduced ? 0 : 500);
  };

  const onTrackScroll = () => {
    if (scrollingFromControl.current) return;
    const track = trackRef.current;
    if (!track) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    setActive((prev) => (prev === index ? prev : index));
  };

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:gap-4">
      {/* Desktop: vertical thumbnail rail */}
      <div className="hidden lg:flex lg:w-20 lg:flex-none lg:flex-col lg:gap-2 lg:overflow-y-auto">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => scrollToIndex(i)}
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

      {/* Main image: swipe/drag-scroll carousel, snap-aligned per image */}
      <div className="group relative flex-1">
        <div
          ref={trackRef}
          onScroll={onTrackScroll}
          role="group"
          aria-roledescription="carousel"
          aria-label={`${title} images`}
          className="flex aspect-[3/4] snap-x snap-mandatory overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((img, i) => (
            <div
              key={img.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`Image ${i + 1} of ${images.length}`}
              className="relative aspect-[3/4] w-full flex-none snap-center overflow-hidden border border-brand-100 bg-brand-50"
            >
              <ZoomableSlide
                src={img.image_url}
                alt={altFor(title, i)}
                isActive={i === activeIndex}
                priority={i === 0}
              />
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => scrollToIndex(activeIndex - 1)}
              disabled={activeIndex === 0}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center bg-ink/70 text-cream opacity-0 transition-opacity hover:bg-ink group-hover:opacity-100 focus-visible:opacity-100 disabled:pointer-events-none disabled:opacity-0 lg:grid"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollToIndex(activeIndex + 1)}
              disabled={activeIndex === images.length - 1}
              aria-label="Next image"
              className="absolute right-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center bg-ink/70 text-cream opacity-0 transition-opacity hover:bg-ink group-hover:opacity-100 focus-visible:opacity-100 disabled:pointer-events-none disabled:opacity-0 lg:grid"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div
              aria-hidden
              className="absolute bottom-2 right-2 bg-ink/80 px-2 py-1 text-xs font-semibold tracking-wide text-cream"
            >
              {activeIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Mobile: scrollable thumbnail strip, synced with the swipeable main image */}
      <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => scrollToIndex(i)}
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
