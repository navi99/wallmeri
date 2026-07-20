import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Wallmeri",
  description:
    "What personal data Wallmeri collects, how it's used, who it's shared with, and your rights over it.",
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
    title: "1. Information We Collect",
    bullets: [
      "Account & order data: name, email, phone number, shipping address.",
      "Payment data: processed securely by our payment partner, Razorpay. We do not store your card, UPI, or bank details on our servers.",
      "Usage data: pages visited, device/browser type, and general location, collected via cookies and analytics tools to improve the Site.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    bullets: [
      "To process and deliver your orders",
      "To communicate order updates (email/WhatsApp/SMS)",
      "To provide customer support",
      "To send marketing updates, only if you've opted in — you can unsubscribe anytime",
      "To improve the Site's performance and content",
    ],
  },
  {
    title: "3. Sharing Your Information",
    paragraphs: ["We share data only as needed to fulfil your order:"],
    bullets: [
      "Razorpay — to process payments",
      "Shipping/courier partners — to deliver your order",
      "Analytics providers — in aggregated, non-identifying form where possible",
    ],
    afterBullets: ["We do not sell your personal data to third parties."],
  },
  {
    title: "4. Cookies",
    paragraphs: [
      "We use cookies to keep you logged in, remember your cart, and understand how the Site is used. You can disable cookies in your browser settings, though some features may not work as intended.",
    ],
  },
  {
    title: "5. Data Security",
    paragraphs: [
      "We use reasonable technical and organizational safeguards to protect your data. No online system is 100% secure, but we take this seriously.",
    ],
  },
  {
    title: "6. Data Retention",
    paragraphs: [
      "We retain your order and account information for as long as needed to fulfil orders, meet legal/tax obligations, and resolve disputes, after which it's securely deleted or anonymized.",
    ],
  },
  {
    title: "7. Your Rights",
    paragraphs: ["Under applicable Indian data protection law, you can request to:"],
    bullets: [
      "Access the personal data we hold about you",
      "Correct inaccurate data",
      "Request deletion of your data, subject to legal/record-keeping requirements",
      "Withdraw marketing consent at any time",
    ],
    afterBullets: [
      "To exercise these rights, contact us at support@wallmeri.in.",
    ],
  },
  {
    title: "8. Children's Privacy",
    paragraphs: [
      "Wallmeri is not intended for users under 18. We don't knowingly collect data from minors.",
    ],
  },
  {
    title: "9. Changes to This Policy",
    paragraphs: [
      "We may update this Privacy Policy from time to time. Material changes will be reflected here with an updated date.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto max-w-[760px]">
        <h1 className="text-3xl font-bold uppercase tracking-tight text-ink">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-muted">Last updated: 20 July 2026</p>

        <p className={`mt-6 ${body}`}>
          Wallmeri (&quot;we,&quot; &quot;us&quot;) respects your privacy. This policy explains
          what personal data we collect, how we use it, and your rights.
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
              {s.afterBullets?.map((p) => (
                <p key={p} className={`mt-3 ${body}`}>
                  {p}
                </p>
              ))}
            </div>
          ))}

          <div className="border-t border-ink/10 py-7">
            <h2 className={heading}>10. Contact</h2>
            <p className={`mt-3 ${body}`}>
              Questions about your data? Reach us on{" "}
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
