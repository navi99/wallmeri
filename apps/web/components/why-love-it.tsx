import { ShieldCheck } from "lucide-react";

export function WhyLoveIt() {
  return (
    <section className="mt-14 max-w-prose">
      <h2 className="text-2xl font-bold text-ink">
        Why You&rsquo;ll <span className="font-display italic text-brand-600">Love It</span>
      </h2>

      <p className="mt-4 leading-relaxed text-muted">
        Chosen for those who value exceptional art and thoughtful interiors. Whether displayed as a statement piece or as part of a curated collection, it brings depth, balance, and quiet character to any space.
      </p>
      <p className="mt-4 leading-relaxed text-muted">
        Produced using high-resolution sublimation printing on premium aluminium, every detail is rendered with remarkable clarity and lasting colour. Its refined finish complements living rooms, bedrooms, studios, offices, and other carefully designed interiors.
      </p>

      <p className="mt-4 font-display text-2xl italic text-brand-600">&ldquo;A timeless work, crafted to be lived with.&rdquo;</p>

      <div className="mt-6 flex items-start gap-3 border border-ink/10 bg-paper p-5">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
        <p className="text-sm leading-relaxed text-muted">
          <span className="font-semibold text-ink">Note: </span>
          Product colours may vary slightly depending on your screen and lighting.
        </p>
      </div>
    </section>
  );
}
