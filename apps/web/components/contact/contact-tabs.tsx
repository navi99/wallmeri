"use client";

import { useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PackageCheck } from "lucide-react";

import { ConnectPanel } from "@/components/contact/connect-panel";
import { ContactForm } from "@/components/contact/contact-form";
import { FaqAccordion } from "@/components/contact/faq-accordion";
import type { ContactCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "contactus", label: "Contact us" },
  { id: "connect", label: "Connect" },
  { id: "faq", label: "FAQ" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const CATEGORIES: ContactCategory[] = [
  "order",
  "product",
  "returns",
  "wholesale",
  "artist",
  "general",
];

export function ContactTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // The tab lives in the URL rather than in state so the FAQ and a
  // pre-filled form are both linkable - from the footer, the policy pages and
  // the returns callout below.
  const raw = params.get("tab");
  const active: TabId = TABS.some((t) => t.id === raw) ? (raw as TabId) : "contactus";

  const rawCategory = params.get("category");
  const defaultCategory: ContactCategory = CATEGORIES.includes(rawCategory as ContactCategory)
    ? (rawCategory as ContactCategory)
    : "general";

  const selectTab = useCallback(
    (id: TabId) => {
      const next = new URLSearchParams(params.toString());
      next.set("tab", id);
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  return (
    <div>
      <div
        role="tablist"
        aria-label="Contact sections"
        className="flex gap-1 overflow-x-auto border-b border-line"
      >
        {TABS.map((t) => {
          const selected = t.id === active;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`panel-${t.id}`}
              onClick={() => selectTab(t.id)}
              className={cn(
                "label -mb-px shrink-0 border-b-2 px-5 py-4 transition-colors",
                selected
                  ? "border-brand-600 text-ink"
                  : "border-transparent text-muted hover:text-ink",
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`panel-${active}`}
        aria-labelledby={`tab-${active}`}
        className="py-[clamp(40px,5vw,72px)]"
      >
        {active === "contactus" && <ContactPanel defaultCategory={defaultCategory} />}
        {active === "connect" && <ConnectPanel />}
        {active === "faq" && <FaqAccordion />}
      </div>
    </div>
  );
}

function ContactPanel({ defaultCategory }: { defaultCategory: ContactCategory }) {
  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-x-[clamp(40px,6vw,96px)]">
      <div className="max-w-[60ch]">
        {/* No Cormorant accent here: the page hero already carries one, and
            the Engraving Rule allows at most one per viewport. */}
        <h2 className="title-lg">Tell us what you need</h2>
        <p className="mt-4 text-sm leading-[1.75] text-muted">
          There is no ticketing queue and no bot on the other end. Messages go straight to
          the small team that prints and packs your order, and we answer most of them within
          one business day.
        </p>
        <p className="mt-4 text-sm leading-[1.75] text-muted">
          Many questions - delivery windows, mounting, colour, cancellations - are already
          answered on the{" "}
          <Link
            href="/contact?tab=faq"
            className="font-semibold text-premium-600 hover:underline"
          >
            FAQ tab
          </Link>
          . Worth a look before you write.
        </p>

        {/* Return Shipments. Damage claims are time-boxed at 48 hours by the
            refund policy, so this sits on the contact tab rather than buried
            in the FAQ - the customer who needs it is already here. */}
        <div className="mt-10 border border-line bg-paper p-6">
          <div className="flex items-start gap-4">
            <PackageCheck
              className="mt-0.5 h-6 w-6 shrink-0 text-brand-600"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <div>
              <h3 className="title-xs">Return shipments</h3>
              <p className="mt-2 text-sm leading-[1.75] text-muted">
                Arrived damaged, defective, or the wrong piece? Contact us within{" "}
                <span className="font-semibold text-ink">48 hours of delivery</span> with your
                order number and clear photos or an unboxing video. Verified claims get a free
                replacement or a full refund - your choice, and we arrange the return shipment.
              </p>
              <p className="mt-3 text-sm leading-[1.75] text-muted">
                Use the form here and pick{" "}
                <span className="font-semibold text-ink">Returns &amp; replacements</span> so it
                reaches the right person first time.
              </p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                <Link
                  href="/refund-policy"
                  className="text-sm font-semibold text-premium-600 hover:underline"
                >
                  Refund &amp; replacement policy
                </Link>
                <Link
                  href="/track"
                  className="text-sm font-semibold text-premium-600 hover:underline"
                >
                  Track your order
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Keyed so a ?category= link followed from *within* this tab (the
          returns callout) actually re-seeds the select - defaultValues alone
          only applies on mount. */}
      <ContactForm key={defaultCategory} defaultCategory={defaultCategory} />
    </div>
  );
}
