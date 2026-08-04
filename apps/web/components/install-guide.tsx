import { ShieldCheck } from "lucide-react";

const STEPS = [
  {
    n: "1",
    title: "Clean the Wall",
    body: "Wipe the selected wall area with a clean, dry cloth. The surface must be smooth, dry and free from dust, oil, moisture and loose paint.",
  },
  {
    n: "2",
    title: "Attach Magnet to Poster",
    body: "Peel the adhesive backing from the first magnet and press it firmly onto the back of the aluminium poster at the recommended position.",
  },
  {
    n: "3",
    title: "Attach Magnet to Wall",
    body: "Peel the adhesive backing from the second magnet and press it firmly onto the selected wall position.",
  },
  {
    n: "4",
    title: "Align and Mount",
    body: "Align the poster-side magnet with the wall-side magnet. Allow both magnets to connect and hold the poster firmly.",
  },
];

export function InstallGuide() {
  return (
    <section className="mt-16 md:mt-24">
      <h2 className="title-lg border-b border-line pb-4">
        Installation <em className="accent">guide</em>
      </h2>
      <p className="mt-3 text-sm text-muted">Installs in four simple steps. No drilling. No wall damage.</p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step) => (
          <article key={step.n} className="flex flex-col border border-line bg-cream">
            <div className="grid place-items-center border-b border-line bg-paper py-9">
              <div className="grid h-24 w-24 place-items-center rounded-full bg-ink">
                <span className="font-display text-4xl italic text-cream">{step.n}</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 px-6 py-7">
              <h3 className="title-xs">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{step.body}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 flex items-start gap-3 border border-line bg-paper p-5">
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
