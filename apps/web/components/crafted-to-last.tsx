import { Droplets, ShieldCheck, Timer, Truck } from "lucide-react";

import { FeatureTile, type Tile } from "@/components/feature-tile";

// Every claim here is load-bearing — keep it in step with the policy pages it
// paraphrases (shipping-policy §1/§2, refund-policy §1) and with the print
// process described on the About page.
const assurances: Tile[] = [
  {
    icon: Droplets,
    title: "Sublimation on Aluminium",
    spec: "Premium metal print",
    body: "Your image is sublimation-printed onto premium aluminium — sharp colour, exceptional durability, and a surface that won't yellow, peel or warp.",
  },
  {
    icon: ShieldCheck,
    title: "Quality Guarantee",
    spec: "Inspected before dispatch",
    body: "Every poster is checked by hand before it leaves us. If it arrives damaged or defective, send photos within 48 hours for a free replacement or a full refund — your choice.",
  },
  {
    icon: Timer,
    title: "Lead Time",
    spec: "5–8 business days",
    body: "Each poster is printed to order. Allow 5–8 business days for printing, quality checks and packaging before your order ships.",
  },
  {
    icon: Truck,
    title: "Shipping Across India",
    spec: "7–20 calendar days",
    body: "We deliver anywhere in India — approximately 7–10 days to Bengaluru, 10–20 days elsewhere, with tracking from the moment it ships.",
  },
];

export function CraftedToLast() {
  return (
    <section className="mt-16 md:mt-24">
      <h2 className="title-lg border-b border-line pb-4">
        Crafted <em className="accent">to last</em>
      </h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {assurances.map((a) => (
          <FeatureTile key={a.title} {...a} />
        ))}
      </div>
    </section>
  );
}
