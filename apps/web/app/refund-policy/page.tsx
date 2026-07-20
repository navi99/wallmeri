import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund & Replacement Policy | Wallmeri",
  description:
    "How Wallmeri handles damaged, defective, wrong-item, and cancelled orders — and how to request a replacement or refund.",
};

const heading = "text-base font-bold uppercase tracking-tight text-ink";
const body = "text-sm leading-[1.75] text-muted";
const link = "font-semibold text-premium-600 hover:underline";

type Section = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

const sections: Section[] = [
  {
    title: "1. Damaged or Defective on Arrival",
    bullets: [
      "Please inspect your package on delivery. If the piece arrives damaged, defective, or significantly different from what was ordered, contact us within 48 hours of delivery.",
      "To process your claim quickly, include your order number, clear photos (or an unboxing video) of the damaged item and packaging.",
      "Verified claims are eligible for a free replacement or a full refund, your choice.",
    ],
  },
  {
    title: "2. Non-Returnable Items",
    paragraphs: [
      "Because each piece is made to order, we don't accept returns or exchanges for reasons of personal preference (e.g., \"doesn't match my wall,\" sizing regret) once printing has begun. Please review dimensions and preview images carefully before ordering.",
    ],
  },
  {
    title: "3. Order Cancellations",
    paragraphs: [
      "Orders can be cancelled for a full refund within 24 hours of placing the order, before printing begins. After that window, the order enters production and cannot be cancelled.",
    ],
  },
  {
    title: "4. Wrong Item Received",
    paragraphs: [
      "If you receive a different piece than what you ordered, contact us within 48 hours with photos — we'll arrange a free replacement and, if needed, a prepaid return of the incorrect item.",
    ],
  },
  {
    title: "5. Refund Timelines",
    paragraphs: [
      "Approved refunds are issued to your original payment method within 7–10 business days. You'll receive a confirmation once the refund is initiated; actual credit timing can depend on your bank or card issuer.",
    ],
  },
  {
    title: "6. How to Request a Replacement or Refund",
    paragraphs: ["Message us on WhatsApp or by email with:"],
    bullets: ["Order number", "Photos/video of the issue", "Preferred resolution (replacement or refund)"],
  },
  {
    title: "7. Colour & Print Variation",
    paragraphs: [
      "Minor colour variation between screen and printed metal is normal due to display differences and is not treated as a defect.",
    ],
  },
];

export default function RefundPolicyPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto max-w-[760px]">
        <h1 className="text-3xl font-bold uppercase tracking-tight text-ink">
          Refund & Replacement Policy
        </h1>
        <p className="mt-2 text-sm text-muted">Last updated: 20 July 2026</p>

        <p className={`mt-6 ${body}`}>
          Because every piece is printed to order specifically for you, we&apos;re unable to
          accept returns for change of mind. That said, if something arrives damaged,
          defective, or wrong, we&apos;ll make it right.
        </p>

        <div className="mt-10 flex flex-col">
          {sections.map((s) => (
            <div key={s.title} className="border-t border-ink/10 py-7 first:border-t-0 first:pt-0">
              <h2 className={heading}>{s.title}</h2>
              {s.paragraphs?.map((p) => (
                <p key={p} className={`mt-3 ${body}`}>
                  {p}
                </p>
              ))}
              {s.bullets && (
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  {s.bullets.map((b) => (
                    <li key={b} className={body}>
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          <div className="border-t border-ink/10 py-7">
            <h2 className={heading}>8. Contact</h2>
            <p className={`mt-3 ${body}`}>
              For anything not covered here, reach out on{" "}
              <a
                href="https://wa.me/916363882696"
                target="_blank"
                rel="noopener noreferrer"
                className={link}
              >
                WhatsApp
              </a>{" "}
              or at{" "}
              <a href="mailto:support@wallmeri.in" className={link}>
                support@wallmeri.in
              </a>
              , we&apos;ll sort it out.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
