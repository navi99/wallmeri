// Scrolling trust strip for the homepage, promoted out of the static trust
// bar so repeat visitors register it as a signal, not another line of copy.
// Pure CSS: the track renders the phrase list twice back-to-back and loops
// translateX(-50%) (see .animate-marquee in globals.css), pauses on hover,
// and collapses to a plain wrapped, non-animated row under
// prefers-reduced-motion (the second copy is hidden so it doesn't repeat).
export function HomeMarquee({ items }: { items: string[] }) {
  return (
    <section className="overflow-hidden border-b border-ink/10 bg-paper">
      <div className="flex w-max animate-marquee whitespace-nowrap py-4 hover:[animation-play-state:paused] motion-reduce:w-full motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-y-2">
        {[0, 1].map((rep) => (
          <div
            key={rep}
            aria-hidden={rep === 1}
            className={rep === 0 ? "flex shrink-0 motion-reduce:contents" : "flex shrink-0 motion-reduce:hidden"}
          >
            {items.map((item, i) => (
              <span
                key={`${rep}-${i}`}
                className="flex items-center gap-3 px-8 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted"
              >
                <span>{item}</span>
                <span className="h-1 w-1 rounded-full bg-ink/25" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
