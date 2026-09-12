"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

type Faq = {
  q: string;
  /** Plain sentences; the last one may carry the policy link. */
  a: string;
  link?: { href: string; label: string };
};

type FaqGroup = { title: string; items: Faq[] };

// Every answer below is drawn from the policy pages so the two can never
// disagree - shipping windows from /shipping-policy, the 48-hour and 24-hour
// windows from /refund-policy. Answers summarise and then link out rather
// than restating the policy in different words.
const GROUPS: FaqGroup[] = [
  {
    title: "Orders & delivery",
    items: [
      {
        q: "How long until my poster arrives?",
        a: "Every piece is printed after you order, so allow about 5-8 business days for preparation. From order confirmation, delivery is roughly 7-10 days in Bengaluru and 10-20 days elsewhere in India.",
        link: { href: "/shipping-policy", label: "Read the shipping policy" },
      },
      {
        q: "Why is there no tracking number yet?",
        a: "Because nothing is sitting in a warehouse. Tracking is shared by email or WhatsApp once your piece is printed, quality-checked, packed and handed to the courier.",
        link: { href: "/track", label: "Track an order" },
      },
      {
        q: "Do you ship outside India?",
        a: "Not yet. WallMeri currently delivers across India only.",
      },
      {
        q: "Can I change my shipping address after ordering?",
        a: "Usually yes, if production hasn't started. Message us with your order number as soon as you can and we'll sort it out.",
      },
    ],
  },
  {
    title: "Product & care",
    items: [
      {
        q: "What are the posters actually made of?",
        a: "Premium aluminium with a clean matte finish, printed by sublimation so the ink becomes part of the surface rather than sitting on top of it.",
      },
      {
        q: "How do I hang one without drilling?",
        a: "Every piece ships with a magnetic mounting system - a small mount goes on the wall, the poster snaps onto it. No drilling into the poster, no frame needed.",
      },
      {
        q: "Will the colours match what I see on screen?",
        a: "Very closely, but not exactly. Screens emit light and metal reflects it, so slight variation between your display and the finished print is normal and isn't considered a defect.",
        link: { href: "/refund-policy", label: "Read about colour variation" },
      },
      {
        q: "How do I clean it?",
        a: "A dry or lightly damp soft cloth. Skip solvents and abrasive cleaners.",
      },
    ],
  },
  {
    title: "Returns & replacements",
    items: [
      {
        q: "It arrived damaged. What now?",
        a: "Contact us within 48 hours of delivery with your order number and clear photos or an unboxing video of the damage and the packaging. Verified claims get a free replacement or a full refund - your choice.",
        link: { href: "/contact?tab=contactus&category=returns", label: "Report it now" },
      },
      {
        q: "Can I return a piece I simply don't like?",
        a: "No - each poster is made to order, so we can't accept returns for preference or sizing regret once printing has begun. Please check the dimensions and preview carefully before ordering.",
        link: { href: "/refund-policy", label: "Read the refund policy" },
      },
      {
        q: "Can I cancel my order?",
        a: "Yes, for a full refund, within 24 hours of placing it and before printing begins. After that the order is in production and can't be cancelled.",
      },
      {
        q: "How long do refunds take?",
        a: "Approved refunds go back to your original payment method within 7-10 business days. Your bank or card issuer may add a little time on top.",
      },
    ],
  },
  {
    title: "Custom art & artists",
    items: [
      {
        q: "Can I put my own image on metal?",
        a: "Yes. Upload your image, crop it to the size you want, and we'll print it. Every custom upload is reviewed by a person before printing - usually within 1-2 business days.",
        link: { href: "/create", label: "Create your own" },
      },
      {
        q: "What happens if my custom design isn't approved?",
        a: "You're refunded in full and we'll email you the reason. Nothing goes to print without passing review first.",
      },
      {
        q: "I'm an artist. How do I sell through WallMeri?",
        a: "We work with a small, curated set of artists. Send us your portfolio - we review every application personally, then talk to you about your work before anything goes live.",
        link: { href: "/artists/join", label: "Apply as an artist" },
      },
      {
        q: "Do you take bulk or corporate orders?",
        a: "We do - gifting, offices, hospitality. Tell us roughly how many pieces and by when, and we'll come back with options.",
        link: { href: "/contact?tab=contactus&category=wholesale", label: "Ask about bulk orders" },
      },
    ],
  },
];

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

export function FaqAccordion() {
  return (
    <div className="mx-auto max-w-[860px]">
      <p className="max-w-[65ch] text-sm leading-[1.75] text-muted">
        The questions we get asked most. If yours isn&apos;t here, send us a message - we
        answer everything ourselves.
      </p>
      <div className="mt-10 space-y-12">
        {GROUPS.map((group) => (
          <section key={group.title}>
            <h3 className="label border-b border-line pb-3 text-muted">{group.title}</h3>
            <div className="mt-2">
              {group.items.map((item) => (
                <FaqRow key={item.q} item={item} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
