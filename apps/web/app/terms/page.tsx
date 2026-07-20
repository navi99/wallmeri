import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions | Wallmeri",
  description:
    "The terms and conditions governing your use of wallmeri.com and any purchase made through it.",
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
    title: "1. About Wallmeri",
    paragraphs: [
      "Wallmeri is a curated online marketplace that licenses original artwork from independent artists and reproduces it as premium metal wall art, printed to order and shipped across India.",
    ],
  },
  {
    title: "2. Eligibility",
    paragraphs: [
      "You must be at least 18 years old, or using the Site under the supervision of a parent or guardian, to place an order.",
    ],
  },
  {
    title: "3. Products",
    bullets: [
      "All artwork is licensed from the featured artist and reproduced under agreement; Wallmeri does not claim original authorship of the artwork itself.",
      "Each piece is printed to order on premium metal using a sublimation process. Minor variations in colour between what you see on screen and the printed piece can occur due to display calibration and are not considered defects.",
      "Product dimensions, weight, and mounting hardware are as described on each product page.",
    ],
  },
  {
    title: "4. Orders & Payment",
    bullets: [
      "All prices are listed in INR and inclusive of applicable taxes unless stated otherwise.",
      "Orders are confirmed only after successful payment via our secure payment partner (Razorpay).",
      "Wallmeri reserves the right to cancel any order due to stock issues, pricing errors, or suspected fraud, with a full refund issued in such cases.",
    ],
  },
  {
    title: "5. Shipping",
    paragraphs: [
      "Orders are made to order and shipped across India. Risk of loss passes to you upon delivery; see our Refund & Replacement Policy for damage-in-transit coverage.",
    ],
  },
  {
    title: "6. Intellectual Property",
    paragraphs: [
      "All artwork remains the intellectual property of the respective artist. Purchasing a printed piece from Wallmeri grants you ownership of that physical product only — it does not grant you rights to reproduce, resell as a print, or commercially exploit the underlying artwork.",
    ],
  },
  {
    title: "7. User Conduct",
    paragraphs: [
      "You agree not to misuse the Site, attempt unauthorized access, or use content from the Site (including artist images) without permission.",
    ],
  },
  {
    title: "8. Limitation of Liability",
    paragraphs: [
      "Wallmeri is not liable for indirect or consequential damages arising from use of the Site or products, beyond the value of the order in question, except where such limitation is not permitted by law.",
    ],
  },
  {
    title: "9. Governing Law",
    paragraphs: [
      "These Terms are governed by the laws of India, with courts in Bengaluru, Karnataka having exclusive jurisdiction.",
    ],
  },
  {
    title: "10. Changes to These Terms",
    paragraphs: [
      "Wallmeri may update these Terms from time to time. Continued use of the Site after changes constitutes acceptance of the updated Terms.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto max-w-[760px]">
        <h1 className="text-3xl font-bold uppercase tracking-tight text-ink">
          Terms & Conditions
        </h1>
        <p className="mt-2 text-sm text-muted">Last updated: 20 July 2026</p>

        <p className={`mt-6 ${body}`}>
          Welcome to Wallmeri. These Terms & Conditions (&quot;Terms&quot;) govern your use of
          wallmeri.com (the &quot;Site&quot;) and any purchase made through it. By browsing the
          Site or placing an order, you agree to these Terms. If you don&apos;t agree, please
          don&apos;t use the Site.
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
            <h2 className={heading}>11. Contact</h2>
            <p className={`mt-3 ${body}`}>
              Questions about these Terms? Reach us on{" "}
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
