import { Check } from "lucide-react";

const BOX_CONTENTS = [
  "One premium aluminium metal poster",
  "Two adhesive-backed magnetic mounts",
  "Protective packaging",
  "Installation guide",
  "A thank-you note from Wallmeri",
];

export function BoxContents() {
  return (
    <section className="mt-14">
      <h2 className="text-2xl font-bold text-ink">
        Inside <span className="font-display italic text-brand-600">the Box</span>
      </h2>
      <p className="mt-1 text-sm text-muted">Thoughtfully packed and ready to mount.</p>

      <ul className="mt-6 flex flex-wrap border-l border-t border-ink/10">
        {BOX_CONTENTS.map((item) => (
          <li
            key={item}
            className="flex w-full items-start gap-3 border-b border-r border-ink/10 bg-paper p-5 sm:w-1/2 lg:w-1/3"
          >
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            <span className="text-sm leading-relaxed text-ink">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
