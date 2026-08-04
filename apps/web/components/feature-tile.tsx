import type { LucideIcon } from "lucide-react";

// A recessed Paper panel holding a Noir icon disc, over a text block of
// title, an optional spec line, then the detail.
//
// The round disc is an icon *holder*, one of the three exemptions to radius 0
// (DESIGN.md §5 The Cut-Edge Rule) — a mark drawn behind a glyph, not a surface
// with an edge in the layout. It stays round only for as long as that holds:
// give this shape a neighbour, or let it bound content, and it goes back to a
// cut edge. See §5 Feature tile for why the disc is sized above the square chip
// it replaced.
export type Tile = {
  icon: LucideIcon;
  title: string;
  spec?: string;
  body?: string;
};

export function FeatureTile({ icon: Icon, title, spec, body }: Tile) {
  return (
    <article className="flex flex-col border border-line bg-cream">
      <div className="grid place-items-center border-b border-line bg-paper py-9">
        <div className="grid h-24 w-24 place-items-center rounded-full bg-ink">
          <Icon className="h-11 w-11 text-cream" strokeWidth={1.25} aria-hidden="true" />
        </div>
      </div>
      <div className="flex flex-col gap-3 px-6 py-7">
        <div className="flex flex-col gap-1">
          <h3 className="title-xs">{title}</h3>
          {spec && <p className="label text-xs text-muted">{spec}</p>}
        </div>
        {body && <p className="text-sm leading-relaxed text-muted">{body}</p>}
      </div>
    </article>
  );
}
