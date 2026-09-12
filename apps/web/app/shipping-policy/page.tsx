import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shipping Policy | WallMeri",
  description:
    "Processing times, delivery timelines, shipping charges, and coverage for WallMeri orders across India.",
};

const heading = "title-xs";
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
    title: "1. Made-to-Order Processing",
    paragraphs: [
      "Every Wallmeri metal poster is printed and prepared after an order is successfully placed. We do not keep finished posters in ready stock.",
      "The preparation process includes printing, receiving the metal poster at our Bengaluru fulfilment location, attaching the back panel, quality checking and secure packaging.",
      "Please allow approximately 5–8 business days for your order to be prepared for dispatch.",
    ],
  },
  {
    title: "2. Estimated Delivery Time",
    paragraphs: ["The estimated delivery time from the date of order confirmation is:"],
    bullets: [
      "Bengaluru: Approximately 7–10 calendar days",
      "Other locations across India: Approximately 10–20 calendar days",
    ],
    afterBullets: [
      "These timelines include product preparation, quality checks, packaging and courier delivery.",
    ],
  },
  {
    title: "3. Delivery Estimates",
    paragraphs: [
      "Delivery timelines are estimates and not guaranteed delivery dates. Orders may occasionally take longer because of public holidays, courier delays, severe weather, transportation disruptions, incorrect address information or delivery to remote locations.",
      "Wallmeri will make every reasonable effort to deliver orders within the estimated timeline.",
    ],
  },
  {
    title: "4. Order Tracking",
    paragraphs: [
      "Tracking details will be shared through email or WhatsApp after the order has been packed and handed over to our courier partner.",
      "Tracking may not be immediately available after placing the order because every Wallmeri product is made to order.",
    ],
  },
  {
    title: "5. Shipping Coverage",
    paragraphs: [
      "Wallmeri currently delivers across India. International delivery is not available at this time.",
    ],
  },
  {
    title: "6. Delayed Orders",
    paragraphs: [
      "If your order has not been delivered within 20 days of order confirmation, please contact Wallmeri with your order number. We will check the shipment status with our production and courier partners and provide an update.",
      "A delay beyond the estimated timeline does not automatically mean that the shipment is lost or eligible for cancellation. If a shipment is officially confirmed as lost in transit, Wallmeri will provide an appropriate replacement or refund in accordance with the Refund and Replacement Policy.",
    ],
  },
];

export default function ShippingPolicyPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto max-w-[760px]">
        <h1 className="title-xl">
          Shipping Policy
        </h1>
        <p className="mt-2 text-sm text-muted">Last updated: 4 August 2026</p>

        <div className="mt-10 flex flex-col">
          {sections.map((s) => (
            <div key={s.title} className="border-t border-line py-7 first:border-t-0 first:pt-0">
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

          <div className="border-t border-line py-7">
            <h2 className={heading}>7. Contact</h2>
            <p className={`mt-3 ${body}`}>
              Questions about your shipment?{" "}
              <Link href="/contact" className={link}>
                Send us a message
              </Link>
              , or reach us on{" "}
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
