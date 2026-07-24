"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";

// A pointer-following glow, adapted to the Steel Gallery system: sharp edges
// (no rounded-2xl), a single Premium Red glow (no rainbow hue picker), and a
// Paper surface instead of frosted glass — glassmorphism is banned in
// DESIGN.md. The glow is the only thing that moves; layout/shape stays put.
export function SpotlightCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const spotRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    spotRef.current?.style.setProperty("--x", `${e.clientX - rect.left}px`);
    spotRef.current?.style.setProperty("--y", `${e.clientY - rect.top}px`);
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`group/spotlight relative overflow-hidden ${className}`}
    >
      <div
        ref={spotRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover/spotlight:opacity-100 motion-reduce:!opacity-0"
        style={{
          background:
            "radial-gradient(220px 220px at var(--x, 50%) var(--y, 50%), rgba(179,38,36,0.20), transparent 70%)",
        }}
      />
      {children}
    </div>
  );
}
