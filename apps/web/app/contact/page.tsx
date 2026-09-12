import { Suspense } from "react";
import type { Metadata } from "next";

import { ContactTabs } from "@/components/contact/contact-tabs";

export const metadata: Metadata = {
  title: "Contact Us | WallMeri",
  description:
    "Reach the WallMeri team - order questions, returns and replacements, bulk enquiries, or anything else. Answers to the questions we get asked most, and every way to get in touch.",
};

export default function ContactPage() {
  return (
    <div className="container-page py-[clamp(48px,6vw,88px)]">
      <header className="max-w-[62ch]">
        <p className="kicker">We&apos;re listening</p>
        <h1 className="mt-3 title-xl [text-wrap:balance]">
          Contact <em className="accent">us</em>
        </h1>
        <p className="mt-5 text-sm leading-[1.75] text-muted sm:text-base">
          Whether it&apos;s an order on its way, a piece that arrived wrong, or a wall you
          want help filling - write to us and a person will answer.
        </p>
      </header>

      <div className="mt-[clamp(40px,5vw,72px)]">
        {/* useSearchParams needs a suspense boundary for the static shell. */}
        <Suspense fallback={<div className="h-16 border-b border-line" />}>
          <ContactTabs />
        </Suspense>
      </div>
    </div>
  );
}
