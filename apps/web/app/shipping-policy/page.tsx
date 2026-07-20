import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shipping Policy | Wallmeri",
  description:
    "Processing times, delivery timelines, shipping charges, and coverage for Wallmeri orders across India.",
};

const heading = "text-base font-bold uppercase tracking-tight text-ink";
const body = "text-sm leading-[1.75] text-muted";
const link = "font-semibold text-premium-600 hover:underline";

type Section = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  afterBullets?: string[];
};

const sections: Section[] = [
  {
    title: "1. Processing Time",
    paragraphs: [
      "Every piece is printed to order. Please allow 3–5 business days for printing and quality checks before your order ships.",
    ],
  },
  {
    title: "2. Delivery Timelines",
    paragraphs: ["Once shipped, estimated delivery is:"],
    bullets: ["Metro cities: 2–4 business days", "Rest of India: 4–7 business days"],
    afterBullets: [
      "Delivery times are estimates and can vary due to courier delays, weather, or remote locations.",
    ],
  },
  {
    title: "3. Shipping Charges",
    paragraphs: [
      "Free shipping on orders above ₹2,999. Orders below this amount incur a flat shipping fee of ₹99, shown at checkout.",
    ],
  },
  {
    title: "4. Order Tracking",
    paragraphs: [
      "You'll receive a tracking link by email/WhatsApp once your order ships. You can also check order status from your account.",
    ],
  },
  {
    title: "5. Shipping Coverage",
    paragraphs: [
      "We currently ship across India only. International shipping is not available at this time.",
    ],
  },
  {
    title: "6. Address Accuracy",
    paragraphs: [
      "Please double-check your shipping address at checkout — we're not responsible for delays or non-delivery due to incorrect or incomplete addresses. Contact us within 24 hours of ordering if you need to correct an address.",
    ],
  },
  {
    title: "7. Delayed or Lost Shipments",
    paragraphs: [
      "If your order hasn't arrived within the estimated window, contact us with your order number and we'll investigate with our courier partner. If a shipment is confirmed lost in transit, we'll offer a free replacement or full refund.",
    ],
  },
];

export default function ShippingPolicyPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto max-w-[760px]">
        <h1 className="text-3xl font-bold uppercase tracking-tight text-ink">
          Shipping Policy
        </h1>
        <p className="mt-2 text-sm text-muted">Last updated: 20 July 2026</p>

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
              {s.afterBullets?.map((p) => (
                <p key={p} className={`mt-3 ${body}`}>
                  {p}
                </p>
              ))}
            </div>
          ))}

          <div className="border-t border-ink/10 py-7">
            <h2 className={heading}>8. Contact</h2>
            <p className={`mt-3 ${body}`}>
              Questions about your shipment? Reach us on{" "}
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
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
