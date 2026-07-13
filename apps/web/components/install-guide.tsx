import { ShieldCheck } from "lucide-react";

const STEPS = [
  {
    n: "1",
    title: "Clean the wall",
    body: "Wipe the selected wall area with a clean, dry cloth. The surface must be smooth, dry and free from dust, oil, moisture and loose paint.",
  },
  {
    n: "2",
    title: "Attach magnet to poster",
    body: "Peel the adhesive backing from the first magnet and press it firmly onto the back of the aluminium poster at the recommended position.",
  },
  {
    n: "3",
    title: "Attach magnet to wall",
    body: "Peel the adhesive backing from the second magnet and press it firmly onto the selected wall position.",
  },
  {
    n: "4",
    title: "Align and mount",
    body: "Align the poster-side magnet with the wall-side magnet. Allow both magnets to connect and hold the poster firmly.",
  },
];

export function InstallGuide() {
  return (
    <section className="mt-14">
      <h2 className="text-2xl font-bold text-ink">
        Installation <span className="font-display italic text-brand-600">Guide</span>
      </h2>
      <p className="mt-1 text-sm text-muted">Magnet-mounted in four steps — no drilling, no damage.</p>

      <div className="mt-6 grid gap-px overflow-hidden border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step) => (
          <div key={step.n} className="bg-paper p-5">
            <span className="font-display text-4xl italic text-brand-600">{step.n}</span>
            <h3 className="mt-2 text-sm font-bold uppercase tracking-[0.04em] text-ink">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-3 border border-t-0 border-ink/10 bg-paper p-5">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
        <p className="text-sm leading-relaxed text-muted">
          <span className="font-semibold text-ink">Installation caution: </span>
          For best adhesion, use only a clean, smooth, dry and stable wall surface. Avoid damp, heavily
          textured, dusty, freshly painted or peeling walls. Follow the adhesive manufacturer&rsquo;s
          recommended pressure and waiting time before mounting the poster.
        </p>
      </div>
    </section>
  );
}
