"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { FAQ_BANDS, FAQ_SECTIONS, type Faq } from "@/components/contact/faq-data";
import { cn } from "@/lib/utils";

// Copy lives in faq-data.ts - see the header comment there for the rule every
// answer follows (each claim traces to a shipped surface, so the FAQ and the
// policy pages can never disagree).

function FaqRow({ item }: { item: Faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-line">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-6 py-5 text-left"
      >
        <span className="title-xs">{item.q}</span>
        <ChevronDown
          className={cn(
            "mt-1 h-4 w-4 shrink-0 text-muted transition-transform duration-200 motion-reduce:transition-none",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div className="max-w-[70ch] pb-6">
          <p className="text-sm leading-[1.75] text-muted">{item.a}</p>
          {item.link && (
            <Link
              href={item.link.href}
              className="mt-3 inline-block text-sm font-semibold text-premium-600 hover:underline"
            >
              {item.link.label}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Section jump list. Sticky rail on `lg+` at the same `top-88px` offset as the
 * listing pages' FilterRail; below that it collapses into a horizontally
 * scrollable chip row rather than a disclosure, because these are anchors
 * rather than state - tapping one should move you, not open a panel first.
 */
function SectionNav() {
  return (
    // `self-start` matters: as a stretched grid item the nav box would fill the
    // whole row, so its links would scroll away while the (full-height) box sat
    // "stuck" doing nothing. Content-height is what makes sticky bite.
    // `min-w-0` keeps the chip row scrolling instead of widening the page: a
    // grid item defaults to `min-width: auto`, so the cell would grow to fit
    // all ten chips and overflow the body sideways.
    <nav
      aria-label="FAQ sections"
      className="min-w-0 lg:sticky lg:top-[88px] lg:self-start"
    >
      <p className="label hidden border-b border-line pb-3 text-muted lg:block">Jump to</p>
      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:mt-3 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0 lg:pb-0">
        {FAQ_SECTIONS.map((section) => (
          <li key={section.id} className="shrink-0 lg:shrink">
            <Link
              href={`#${section.id}`}
              // The 11px desktop step opens to 0.08em: DESIGN.md's chrome note
              // is that 0.03em caps read as cramped once they drop below 12px.
              className="label flex min-h-[44px] items-center whitespace-nowrap border border-line px-3 text-xs text-muted transition-colors hover:border-ink hover:text-ink lg:block lg:min-h-0 lg:whitespace-normal lg:border-0 lg:px-0 lg:py-2 lg:text-[11px] lg:tracking-[0.08em]"
            >
              {section.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function FaqAccordion() {
  return (
    <div className="mx-auto max-w-[1060px]">
      <p className="max-w-[65ch] text-sm leading-[1.75] text-muted">
        The questions we get asked most. If yours isn&apos;t here, send us a message - we
        answer everything ourselves.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[220px_1fr] lg:gap-x-[clamp(40px,5vw,72px)]">
        <SectionNav />

        <div className="space-y-14">
          {FAQ_BANDS.map((band) => (
            <div key={band.title}>
              {/* title-lg, not title-sm: the caps step is where a band heading
                  reads as a plate rather than a card title, and it matches the
                  Contact tab's own "Tell us what you need". */}
              <h2 className="title-lg">{band.title}</h2>
              <div className="mt-8 space-y-12">
                {band.sections.map((section) => (
                  <section key={section.id} id={section.id} className="scroll-mt-[104px]">
                    <h3 className="label border-b border-line pb-3 text-muted">
                      {section.title}
                    </h3>
                    <div className="mt-2">
                      {section.items.map((item) => (
                        <FaqRow key={item.q} item={item} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
