---
name: Wallmeri
description: Premium metal wall art marketplace for India - a well-lit gallery in Cotton, Noir, and Premium Red.
colors:
  premium-red: "#b32624"
  deep-red: "#8f1b1a"
  noir-black: "#1b1717"
  cotton: "#fcfcfb"
  paper: "#f5f5f4"
  grey: "#6b6b6b"
  line: "#e4e4e2"
  brand-50: "#f8f1ec"
  brand-100: "#f0ded4"
  brand-200: "#e2bfae"
  brand-300: "#cd9379"
  brand-400: "#b05c42"
  brand-800: "#6d1413"
  premium-100: "#f7dedd"
typography:
  # The enumerated ramp §3 describes in prose, restated machine-readably: the
  # chrome steps (kicker/label), the body range, and the six-step heading
  # ladder implemented as .title-* in globals.css. Sizes outside this list are
  # drift rather than steps and are meant to be flagged.
  scale:
    kicker: "11px"
    label: "14px"
    body-sm: "0.875rem"
    body: "1rem"
    body-lg: "1.0625rem"
    title-xs: "18px"
    title-sm: "20px"
    title-md: "24px"
    title-lg: "28px"
    title-xl: "40px"
    title-display: "60px"
  heading:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontWeight: 400
    letterSpacing: "0.03em"
    textTransform: "none"
  accent:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontWeight: 500
    fontStyle: "italic"
  body:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    letterSpacing: "0.02em"
  label:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    letterSpacing: "0.03em"
    textTransform: "uppercase"
rounded:
  all: "0"
  full: "9999px"
components:
  button-primary:
    backgroundColor: "{colors.noir-black}"
    textColor: "{colors.cotton}"
    rounded: "0"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.premium-red}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.noir-black}"
    borderColor: "{colors.noir-black}"
    rounded: "0"
    height: "48px"
  card:
    backgroundColor: "{colors.cotton}"
    borderColor: "{colors.line}"
    rounded: "0"
  input:
    backgroundColor: "{colors.cotton}"
    borderColor: "{colors.line}"
    textColor: "{colors.noir-black}"
    rounded: "0"
    height: "48px"
  badge:
    backgroundColor: "rgba(27,23,23,0.05)"
    textColor: "{colors.deep-red}"
    rounded: "0"
---

# Design System: Wallmeri

## 1. Overview

**Creative North Star: "The Steel Gallery"**

Wallmeri is a well-lit gallery for metal art. The Cotton canvas (#FCFCFB) is the gallery wall; Noir Black (#1B1717) is the architectural frame - header, footer, hero - that makes the room feel serious; Premium Red (#B32624) is the curator's signature, spent sparingly on actions and emphasis and nowhere else - there is no red-drenched surface anywhere in the system. The art itself carries all the energy: big 3:4 artwork tiles, chrome that recedes, no UI element competing with a poster. The system rejects the grammar of the discount marketplace (badge clutter, urgency banners), the sterile SaaS landing page, and the twee craft-shop aesthetic - Wallmeri is steel: modern, precise, permanent.

Density is generous but not empty; this is a shop, not a portfolio. The gallery is **quiet**: headings are Montserrat at regular weight, tracked at a constant 0.03em - the emphasis comes from size, case, and air, never from weight. Page and section headings are uppercase site-wide (GALLERY, OUR ARTISTS), and everything below them - card and panel headings, body - stays Title Case, so a page reads as one caps plate over quiet detail rather than caps all the way down. Body copy is grey, not black, so headings read as headings without needing to shout. Cormorant Garamond appears only as an italic accent (an emphasized phrase inside a heading, oversized step numerals, quotes) - the engraving on the steel. Shapes are sharp-edged (radius 0) like cut metal; only avatars, count dots, and icon holders stay round.

**Change log.** System established 2026-07-09 from the Claude Design handoff "Metal Posters E-Commerce Landing". Montserrat replaced Archivo 2026-07-24. Red usage tightened 2026-07-24 - the narrative-band exemption to the Curator's Signature Rule was retired. Homepage hero rebuilt full-bleed video/poster 2026-07-24. The three homepage tile bands moved onto a shared frameless rail 2026-07-25 (§5 Tile rail); the listing pages moved onto the sidebar-and-grid layout 2026-07-25 (§5 Listing layout). Page and section headings went **uppercase site-wide** 2026-07-25 (§3 The Caps-Heading Rule), reversing the "no heading is ever uppercase" clause set six days earlier; the home page's five headings also took a red Cormorant lowercase close the same day. **Icon holders** joined avatars and count dots as an exemption to radius 0 on 2026-07-26, stated as §5 The Cut-Edge Rule - the first widening of that rule since the system was established, arrived at by building the Create page's feature tiles as square chips first and comparing.

**Quiet-gallery pass, 2026-07-25** (reference: arteriorshome.com, measured from their live stylesheet rather than from impression). This is the change that made the system calm, and it touched four things:
- **Typography inverted.** Headings went from Montserrat 700 UPPERCASE to Montserrat 400 Title Case at a constant 0.03em, delivered as the `.title-*` ladder in `globals.css` instead of ad-hoc inline strings. (Case was revisited 2026-07-25 - the top three steps are uppercase again, still at weight 400; the ladder and the tracking constant, which are what this pass was actually for, stand.) This corrects two claims the previous revision recorded wrongly: the reference does **not** widen tracking with size (it holds 0.03em at every step), and the implementation had drifted to *negative* tracking (`tracking-tight`) in 32 places while the doc claimed tracking ran positive. Both are now impossible to reintroduce silently - the ladder is the only sanctioned way to set a heading.
- **Neutrals de-warmed.** Cotton #FAF9F6 → #FCFCFB and Paper #FBFAF4 → #F5F5F4, plus a new hairline token Line #E4E4E2 replacing the ad-hoc `ink/10` and `ink/20` alphas. Paper also **flipped sides**: it used to sit brighter than the canvas (raised cards), it now sits darker (recessed bands).
- **Body copy went grey.** Warm Grey #5F5852 → neutral Grey #6B6B6B, and secondary text that had been full Noir moved onto it, so pages have three tones (heading / body / hairline) instead of one.
- **Red held exactly still.** The Curator's Signature Rule was not touched. The reference has no accent colour at all; Premium Red at ≤10% is what keeps this Wallmeri rather than a copy.

**Open question (tracked in PRODUCT.md):** the brand deck argues for a full-noir reading (art glowing on near-black). The current system is its inverse - light gallery, dark frame. Any move toward noir is a deliberate exploration, not a drift.

**Key Characteristics:**
- Art-first: artwork tiles are the largest, brightest elements on any storefront screen.
- Light gallery, dark frame: Cotton canvas bounded by Noir Black structural surfaces.
- Quiet type: headings at regular weight, one constant tracking value; page and section headings uppercase site-wide, everything below them Title Case.
- One signature accent: Premium Red on ≤10% of any screen, full stop - primary buttons, focus rings, the cart count, kickers. No exceptions, no drenched bands.
- Sharp-edged components: radius 0, quiet hairline borders.
- Two registers: storefront expresses; admin and checkout serve.

## 2. Colors

A three-color identity - Cotton, Premium Red, Noir Black - on a **neutral** light system. The warm terracotta brand ramp survives for red-adjacent states only; it is no longer used for chrome.

### Primary
- **Premium Red** (#B32624, `brand-600` = `premium-600`): the single accent voice everywhere. Primary-button hover, focus-visible outlines, text selection, kickers, prices, the featured badge, the cart count dot - and the red-drenched narrative bands (home and About heroes, how-it-works, vision), where it shares the stage with Noir while Cotton stays the majority. Cotton on premium-600 and premium-600 on Cotton are both 6.2:1. (Replaced Cherry Red #810100 and Maroon #630000, retired 2026-07-12 - one red across the whole site.)
- **Deep Red** (#8F1B1A, `brand-700` = `premium-700`): Premium Red's pressed/hover state and emphasis text (errors, danger-adjacent actions, badge text). Never introduced as an independent accent - resting text links and accents use Premium Red (`brand-600`), never Deep Red.
- **On-red tints** (`premium-100` #F7DEDD, `premium-300` #E08F8B): kicker and numeral text on the rare occasions text sits directly on a Premium Red fill (e.g. a hovered primary button, the "Featured" badge) - not a surface treatment in its own right.

### Neutral
Four tones, in order from lightest. They are **neutral, not warm** - the previous cream/parchment cast was what made the gallery read as a stationery shop rather than a wall.

- **Cotton** (#FCFCFB, `cream`): the page canvas (gallery wall), card and form-field fills, and the text color on all dark or red surfaces.
- **Paper** (#F5F5F4, `paper`): the **recessed** band - alternating sections, hover fills, dormant tints. Note the direction: Paper sits one step *below* the canvas, so a Paper section steps back into the wall. It is not a card surface and never lifts. (Before 2026-07-25 this token did the opposite job - anything still treating `paper` as a raised card fill is stale.)
- **Line** (#E4E4E2, `line`): every hairline on a light surface - rules, card borders, field borders, table dividers. Replaces the ad-hoc `ink/10`/`ink/20` alphas, which drifted apart and tinted warm against the old canvas. Hairlines on Noir stay `cream/10`.
- **Grey** (#6B6B6B, `muted`): body copy, bylines, metadata, counts - the second of the three text tones. 5.19:1 on Cotton. **Do not lighten it.** The reference sets this tone at #767676, which is only 4.42:1 on our canvas and fails AA; #6B6B6B is the same voice inside the contrast budget.
- **Noir Black** (#1B1717, `ink`): headings and primary text, and the structural dark surfaces - sticky header (`bg-cream/95` + backdrop-blur), footer, hero. On dark surfaces, text is Cotton, never white.
- **Brand ramp** (#F8F1EC → #4A0D0C): warm terracotta tints, now scoped to red-adjacent states only - deep-red pressed states (`brand-800` #6D1413) and red-tinted badges. **Not for chrome:** borders, hover fills, and icon tiles use `line`/`paper`, not `brand-50`/`brand-100`, which read as a pink smudge against neutral neutrals.

### Named Rules
**The Curator's Signature Rule.** Premium Red appears on at most ~10% of any screen - transactional or narrative, no exemption. If two red elements compete in one viewport region, one of them is wrong. There is no red-drenched surface anywhere in the system, including hero and closing bands; those use Cotton/Paper or Noir instead, with red confined to a kicker, an accent word, or a button state.

**The No-Pure-White Rule.** There is no #FFFFFF and no #000000. Light surfaces are Cotton or Paper; dark surfaces are Noir Black; text on dark is Cotton. Pure white artwork tiles are the only permitted exception - the art is exempt from every rule. (Deliberate divergence: the reference canvas *is* #FFFFFF. Cotton at #FCFCFB is close enough to read as clean white and keeps the rule honest.)

**The Three-Tone Rule.** A light surface carries exactly three text tones: Noir for headings, Grey for body and metadata, Line for anything decorative. Reaching for a fourth - an `ink/40`, an `ink/60` - is how the old system ended up with eleven greys that no one chose.

## 3. Typography

**Structural Font:** Montserrat (with system-ui fallback), weights 300/400/500/600/700 - headings, body, labels, buttons
**Accent Font:** Cormorant Garamond (with Georgia fallback) - italic accents only, via `.font-display` / `.accent`

**Character:** Geometric sans, set quietly. Montserrat's precise, evenly-drawn geometry carries all structure, and the system's whole voice comes from *restraint* in how it's set: headings at regular weight, at one tracking value. Weight is the variable that decides placard or signage, not case - a 40px heading in Montserrat 400 reads as an engraved gallery plate whether it is Title Case or caps; the same words at **700** read as signage. So the caps introduced 2026-07-25 sit at 400, tracked at the same 0.03em as everything else, and stop at the top three ladder steps. Cormorant Garamond appears in medium-weight italic, in Premium Red, as the single emphasized phrase inside a heading ("EVERY WALL DESERVES *an art.*"), oversized step numerals, and quotes - the engraver's hand, and the lowercase counterweight to the caps.

Reference note, measured rather than assumed: arteriorshome.com runs entirely on Montserrat, sets headings at weight 400 in Title Case, holds `letter-spacing: 0.03em` at *every* size from 18px to 60px, and uses `text-transform: uppercase` in seven rules across its whole stylesheet - all of them buttons. Wallmeri now **diverges** on that last point (see The Caps-Heading Rule): the weight-400 and constant-tracking findings are what we took from the reference, and they are what keep caps reading as a plate rather than as signage. The reference is a measurement, not an authority.

### The ladder
Headings are set with the `.title-*` classes in `apps/web/app/globals.css`, never composed inline. Every step is Montserrat 400 (500 at `.title-xs`, where regular goes limp) at `0.03em`. Sizes are stepped across breakpoints - not fluid `clamp()` - so every heading renders at an integer pixel size and stays crisp at any zoom/DPR. **Case is carried by the class, never by the copy** - never type a heading in caps in the JSX.

| class | size / line-height | case | use |
|---|---|---|---|
| `.title-display` | 32 → 48 → 60px | **CAPS** | hero h1, one per page |
| `.title-xl` | 28 → 40px | **CAPS** | page h1, About section headings |
| `.title-lg` | 24 → 28px | **CAPS** | section h2 |
| `.title-md` | 20 → 24px | Title Case | sub-section |
| `.title-sm` | 20px | Title Case | panel / card h3 |
| `.title-xs` | 18px, weight 500 | Title Case | small headings, empty states, value titles |

`.title-name` is a **modifier**, not a step: it adds `text-transform: none` and nothing else, stacked on a caps step (`title-xl title-name`) to exempt a heading whose content is a name. See The Caps-Heading Rule.

### Chrome and body
- **Label** (`.label` - Montserrat 500, 14px, uppercase, 0.03em): buttons, nav links, column headings, breadcrumbs, tile plaques, facet headers. The larger size is what lets uppercase read as composed; the old 11–12px at 0.16–0.28em was compensating for being too small. Drop to `text-xs` (12px) for subordinate labels - counts, breadcrumbs, text links.
- **Kicker** (`.kicker` - Montserrat 500, 11px, uppercase, 0.08em, Premium Red; `.kicker-on-dark` uses `premium-100`): the eyebrow above heroes and section headings. The one place tracking exceeds 0.03em - at 11px, 0.03em caps read cramped rather than calm. This is a deliberate, documented exception, not licence to reopen tracking elsewhere.
- **Body** (Montserrat 400, 0.875–1.0625rem, leading-relaxed, Grey): product copy, descriptions, metadata. Cap prose at 65–75ch.
- **Numerals** (prices, totals, counts): regular weight at a large size, never bold. A ₹ figure earns attention by being big, not heavy.

### Named Rules
**The Quiet-Heading Rule.** Headings carry **no weight** - regular (400) at every step, every surface, no exceptions. This is the rule that keeps the gallery quiet, and it is unchanged: emphasis comes from size, case, and air, never from weight. (Case moved out of this rule on 2026-07-25 - see below.)

**The Caps-Heading Rule (2026-07-25).** Page h1s and section h2s are **uppercase, site-wide** - `.title-display`, `.title-xl`, `.title-lg`. GALLERY. OUR ARTISTS. FEATURED PIECES. CHECKOUT. Caps live in the class, never in the copy: write `Gallery` in the JSX and let `.title-xl` set it, so the accessible name, the `<title>`, and search results stay sentence-cased while the render shouts.

The split is by **step, not by page** - the three steps below (`.title-md/sm/xs`) stay Title Case. Those are panel, card, and empty-state headings at 18–24px, where caps stop reading as an engraved plate and start reading as shouting, and they are where the quiet register (checkout, admin) does most of its work. A page therefore reads as one caps plate over Title Case detail, rather than caps all the way down.

**Names are exempt.** A heading whose content *is* a name - an artwork's title, an artist's name - takes `.title-name` and stays as typed. Those strings belong to the artist, not to our chrome: "GALLERY" is a place on this site and may shout, but an artist's own name shouting back at them is a different act, and an artwork's title is the artist's typography, not ours. Where a heading mixes both, wrap only the name (`POSTERS BY <span class="title-name">Navi</span>`). Current holders: the product h1 (both poster and original), the artist page h1, and the artist's poster-shelf h2. `.title-name` is not a way to quiet a heading you'd simply prefer in Title Case.

Weight, size, and the 0.03em tracking are unchanged by all of this - caps at regular weight and one tracking value read as an engraved plate; it is 700 that would make them signage. Retires the previous rule that no heading is ever uppercase, and the home-page-only scoping that briefly preceded this (same day).

**The Constant-Tracking Rule.** Tracking is `0.03em`, at every size, for headings, body, and labels alike. The one sanctioned exception is `.kicker` (0.08em). The wordmark's 0.2em exception is **retired** - the wordmark is now artwork rather than type (see The Wordmark Rule), so no element sets 0.2em and nothing may cite that exception. **Negative tracking is banned outright** - no `tracking-tight`, no `-0.0Xem`, anywhere. Retuning tracking per component is how the system previously accumulated fourteen different values.

**The Engraving Rule.** Cormorant Garamond appears only in italic, only as an accent - an emphasized phrase in a heading, step numerals, review quotes, an artist monogram. It never sets a full heading, button, form field, body paragraph, or a repeated list item (product titles in a cart, artist names in a grid). **At most one accented heading per section**, and never two in one viewport - once the headings around it are quiet, a second flourish reads as a tic rather than a flourish.

`.accent` carries Premium Red (`brand-600`) itself, so an accent phrase is both the flourish and the brand's one accent voice; it also sets `normal-case`, which is what keeps it lowercase inside a caps heading - the lowercase italic against machined caps is what makes it read as engraving. On a dark ground the caller overrides the colour to `text-premium-300` - Premium Red on Noir is ~2.3:1, well under the 3:1 large-text floor, while premium-300 clears 7:1. The colour is never restated on a light ground; `text-premium-600` alongside `.accent` is redundant.

The home page is the one **documented exception** to "never two accented headings in one viewport": every one of its five headings closes on an accent, and at tall viewports two bands can meet:

| section | heading |
|---|---|
| hero | EVERY WALL DESERVES *an art.* |
| Shop by category | FIND YOUR *next wall.* |
| Featured pieces | A CLOSER *look.* |
| Featured artists | ARTISTS WORTH *knowing.* |
| Sell on Wallmeri | YOUR ART. YOUR WALL. *Your earnings.* |

It holds there because the accent is the *fixed closing move* of a repeating heading form rather than a one-off flourish - the caps set up the italic every time. This licenses nothing elsewhere; on every other page the one-per-section, one-per-viewport limit stands, which is why GALLERY and OUR ARTISTS are plain caps with no italic close.

**The Wordmark Rule.** The wordmark is the **WallMeri lockup** - the framed-diamond mark with "WallMeri" - shipped as artwork in two lockups, each with its own job:

- **Landscape, black** (`/logo-wallmeri.png`): the header, left, 32px tall (36px from `sm`). Wide and quiet - it has to share a 72px bar with nav, search, and utilities.
- **Stacked, white** (`/logo-wallmeri-white.png`): the footer, left, 144px tall (176px from `sm`), sized to fill the footer band's full content height. The footer is the one place the mark is allowed to be *large* - it is the closing signature on the Noir, and it sets the band's height rather than fitting inside it.

Neither is **ever re-typeset** - no setting the letters in Montserrat, no rebuilding the mark in CSS, no recolouring, and no using one lockup where the other belongs. Retires the previous rule ("WALLMERI - Montserrat 500, tracking 0.2em, no logo tile"), which forbade exactly this.

**The logo is exempt from the palette.** The lockup carries its own colours - `#D12626` red, `#110B0D` and `#000000` black, `#FFFFFF` white - which are close to but not identical with Premium Red, Noir, and Cotton, and which break the No-Pure-White Rule outright. This is the same exemption the artwork already has: the logo is a fixed asset, not a surface, and is not a licence to introduce those values anywhere else. Nothing outside the two `<Image>` tags may use them.

## 4. Elevation

Depth is **almost entirely absent**, and that is the point. In a gallery the wall is continuous; only the art is raised. Cards, panels, and form fields sit flat on the canvas, held by a Line hairline and nothing else. Structural depth comes free from the light/dark architecture: the Noir header and footer bound the Cotton wall without needing shadows at all. Interaction may earn `shadow-lift`; rest almost never earns `shadow-card`.

Shadows are also **neutral** now (2026-07-25). Both layers used to carry a deep-red tint so shadows would read as "the brand's own light" - against neutral neutrals that tint showed as a pink halo under every panel.

### Shadow Vocabulary
- **Rest** (`0 1px 2px rgba(27,23,23,0.04), 0 10px 30px rgba(27,23,23,0.06)`): reserved. The only resting shadow in the storefront is the About page's framed hero artwork - the one framed piece in the gallery.
- **Lift** (`0 2px 4px rgba(27,23,23,0.05), 0 16px 40px rgba(27,23,23,0.10)`): hover state on interactive surfaces, where a tile's own hover treatment isn't enough.

### Named Rules
**The Earned-Lift Rule.** `shadow-lift` appears only in response to interaction (hover, drag, active dialog). Nothing rests in a lifted state.

**The Flat-Wall Rule.** A card does not get a fill *and* a border *and* a shadow. On a light surface it gets a Line hairline and the canvas fill - that's it. Reach for `shadow-card` only when a surface genuinely floats above the page (a dropdown panel, a modal), never to make a static panel "pop".

## 5. Components

Sharp and restrained: radius 0 everywhere (cut steel), quiet hairline borders, uppercase tracked labels. Components never compete with artwork.

**The Cut-Edge Rule.** Radius 0 governs *surfaces* - anything with an edge in the layout: cards, panels, buttons, fields, tiles, images, badges. The three exemptions are **marks**, not surfaces: avatars, count dots, and icon holders. A mark is a shape drawn *behind or around* a glyph, sized to it, and it never bounds content or abuts another element's edge - so rounding it doesn't soften the architecture, which is what the rule exists to protect. The test is whether the shape has a neighbour: a card's edge meets other edges and must stay cut; a disc floating inside a panel meets nothing. If you find yourself rounding something that touches another element, the rule is being broken, not applied.

### Buttons
- **Shape:** sharp-edged (radius 0), heights 40/48/56px (sm/md/lg), label set with `.label` - Montserrat 500, 14px uppercase, 0.03em - at every size. (The reference uses a 2px radius; Wallmeri's 0 is a deliberate divergence - the cut edge is identity.)
- **Primary:** Noir fill, Cotton text; hover shifts to Premium Red, active to Deep Red.
- **Outline:** transparent fill, Noir text, 1px Noir border; hover inverts to Noir fill with Cotton text.
- **Ghost:** text-only Noir; hover fills Paper.
- **Danger:** transparent with Deep Red text and border; hover inverts to Deep Red fill.
- **Focus:** global 2px Premium Red `focus-visible` outline, 2px offset. Loading state swaps in a spinner and disables.

### Badge
- **Style:** ink/5 square chip, Deep Red text, 11px uppercase at 0.08em. The "Featured" badge on artwork inverts: Premium Red fill, Cotton text - the only badge allowed on top of art.

### Cards / Containers
- **Corner Style:** sharp (radius 0).
- **Background:** Cotton - the same tone as the wall - with a Line hairline border and **no shadow** (see the Flat-Wall Rule). Paper is for recessed *bands*, not for cards.
- **Product card:** frameless - a bare 3:4 artwork tile (whole tile rises 6px over 300ms on hover), then title (Montserrat 400, 16px, 0.03em) with price in Premium Red on the same baseline row, artist byline in Grey, star rating. The 3:4 ratio is a deliberate divergence from the reference's 1:1 - posters are portrait.
- **Feature tile (2026-07-26):** the `FeatureTile` on the Create page - a recessed Paper panel holding a 96px Noir **icon disc** with the icon knocked out in Cotton at 44px, closed by a Line hairline, over a Cotton body of `.title-xs` title, an optional `.label text-xs` spec line (a print spec: "3–5 business days", "Inspected before dispatch"), then Grey detail copy. Held by a hairline and nothing else - no shadow, no fill on the body beyond the canvas tone. Runs both the four-step process band and the assurance band, so the two read as one plate rather than two card treatments; the process steps simply omit the spec line, and carry their sequence by reading order rather than by a numeral. **Size the disc up, not across:** a circle inscribed in an *n*-px box carries ~78% of the square's area, so a disc swapped in at a square chip's dimensions reads visibly weaker - 96px is what restores the mass of the 80px square it replaced, and the icon needs the extra padding because a circle has no corners to breathe into. This is the pattern that earned icon holders their exemption to The Cut-Edge Rule; it replaced an earlier treatment of `rounded-full bg-premium-600/10` circles with red icons, which broke both that rule's spirit and the ban on red tints in chrome.
- **Hero frame:** the About page's featured artwork sits inside a Noir frame (14px padding) with a deep 60px drop shadow - the one framed piece in the gallery.
- **Full-bleed hero (homepage, 2026-07-24):** the homepage hero is instead full-bleed Noir - an admin-uploaded video (autoplay/muted/loop) if one exists, falling back to the admin's poster image, then a plain Noir panel - with a bottom Noir gradient scrim carrying the overlaid kicker/heading/CTAs. `prefers-reduced-motion` always gets the static poster image, never the video. Because the primary CTA sits directly on Noir/video (not Cotton), it's a solid Premium Red fill rather than the standard Noir-fill/red-hover primary button - the one deliberate exception to that rule, still ≤10% of the viewport.
- **Trust marquee (homepage, 2026-07-24):** the trust badges (`HomeMarquee`) scroll as an infinite-loop strip on Paper, pausing on hover, replacing the static centered trust bar. Collapses to a plain wrapped, non-animated row under `prefers-reduced-motion`.
- **Tile rail (homepage, 2026-07-25):** the shared geometry (`MediaRail`) behind Shop by Category, Featured Pieces, and Featured Artists, so the three bands read as one gallery wall instead of three card treatments. A centered heading sits inside `container-page`; beneath it a **full-bleed** row of tiles runs off both edges of the viewport, separated by a hairline gutter (`clamp(8px,1vw,14px)`, used as both the gap and the outer inset). Tiles are **bare** - no card, no border, no resting shadow, no overlay - and the label sits on the surface *beneath* the tile as a plaque that warms to Premium Red on hover. Every plaque holds a **name** (product title, category, artist), so it takes the product card's Title Case treatment - 16px Montserrat 400 at 0.03em - not the uppercase `.label` voice. The same product appears in this rail and in the Gallery grid; one string must not get two treatments. Artwork tiles hold `aspect-[3/4]`; category and artist tiles use a fixed `clamp(300px,30vw,440px)` height so proportions stay gallery-like at any column count. Columns are `auto-fit minmax(200px,1fr)`, capped per rail (category 440px, artwork 380px, artist 340px per tile) so a short row centers instead of stretching tiles into landscape crops. Hover zooms the *media* 1.05× inside a frame whose cut edges never move; `motion-reduce` drops the zoom. Below `md` the same markup becomes a snap-scroll rail - tiles stay large and bleed off the right edge as the affordance, with `scroll-padding-inline` matching the inset so mandatory snap can't eat it, and the scrollbar chrome hidden (`.no-scrollbar`) while touch/wheel/keyboard scrolling stays intact. This retires the previous treatment on these three bands: `shadow-card` at rest, whole-tile 6px hover lift, the red `SpotlightCard` glow over artwork, and the round artist avatars (artist tiles are now radius-0 portraits; a portrait-less artist gets their initial as a Cormorant italic monogram on `cream/5`).

- **Listing layout (Gallery, Category, Artists, 2026-07-25):** all three listing pages run one structure - breadcrumb, then a heading row (heading left, result count as a Label right) closed by a hairline rule, then a `220px / 1fr` split with a **filter rail** left and a 3-up artwork grid right (2-up below `lg`; gutters `24/32px` across, `48/56px` down - the vertical gutter is deliberately the larger one so rows read as gallery courses, not a table). The rail (`FilterRail`) is sticky at `top-88px` on `lg+` and collapses below it into a single "Filter & Sort" disclosure above the grid. Facets are hairline-separated accordions (Sort, Category, Artist) whose choices are radius-0 14px square indicators that fill Noir when applied - checkbox-shaped but single-select, because the catalog API takes one `category` and one `artist` slug, so they carry `aria-pressed` rather than radio semantics. Artist is closed by default and scrolls past eight entries. "Clear all" is the only Premium Red in the rail. The Gallery's create-your-own callout lives at the foot of the rail - genuinely off to the side of the browsing flow rather than a band across it. This retired the horizontal `<Select>` filter row, the Category page's category pill strip, and the full-width callout band.
  - **Artists** takes the same frame with a sort-only rail (the roster has no server-side facets), so its rail header is suppressed rather than repeating "Sort" twice. Its grid is **square** rather than 3:4 - portraits, not artwork, and the square reads as a roster plate against the Gallery's tall art. Tiles borrow the homepage tile-rail language: bare frame, media-only 1.05× hover zoom, tracked label plaque beneath holding name, piece count, and a two-line bio. The frame carries an `ink/5` tint so a slow or missing portrait reads as a tile rather than a hole; a portrait-less artist still gets the Cormorant italic monogram. This retired the 64px round avatar on a horizontal `Card` - the last round avatars on a browsing surface. The "Are you an artist?" CTA stays a full-width band below the grid (unlike the Gallery's callout, it's an acquisition surface, not an aside), restyled to Paper + hairline.
- **Pagination (2026-07-25):** numbered pages, centered under a hairline rule - `1 … 4 5 6 … 20`, always both ends plus a neighbour each side. The current page is a Noir square with Cotton numerals; the rest are Warm Grey warming to Premium Red. Prev/Next are uppercase tracked Label text, not bordered buttons, and fade to ink/25 at the ends. Replaced the bordered Previous/Next pair with "Page n of m".

### Inputs / Fields
- **Style:** Cotton fill (the canvas, not Paper - a field is a place to write, not a recess), Line border, radius 0, 48px height, Montserrat 0.875rem.
- **Focus:** border darkens to Noir (plus the global red focus outline). Placeholder is Grey.
- **Error:** message below the field in Deep Red (`FieldError`); labels are Montserrat 500, 0.875rem, above the field.

### Navigation
- **Header:** sticky Cotton at 95% opacity with backdrop-blur, Line bottom border, 72px tall. Three-part layout: the logo lockup (32px, 36px from `sm`) and nav links left, search centered, utilities (Login / Cart (n)) right - nav and utilities set with `.label`, hover to Premium Red. Search is an always-visible row beneath the bar on mobile.
- **Footer:** Noir. Stacked white logo lockup left, at the band's full content height (144px, 176px from `sm`); `.label` column headings with 14px Cotton/65 links right; hairline-separated © line on `cream/10`.

### Layout
- **Container:** `container-page` - `max-width: 1440px`, 16/24/32px gutters. Widened from 1280px in the 2026-07-25 pass; the reference runs 1600px, and 1440 is where a 4-up artwork grid stops feeling cramped without the eye losing the row.
- **Section rhythm:** bands are `clamp(64px, 7vw, 112px)` vertical. Air is half of the elegance - if a band feels tight, the fix is padding, not a smaller heading.

## 6. Do's and Don'ts

### Do:
- **Do** let the artwork be the largest, brightest thing on every storefront screen; chrome recedes.
- **Do** set every heading with a `.title-*` class. If none fits, the right move is to argue for a new step in the ladder, not to compose one inline.
- **Do** weave artist attribution through the flow - bylines on cards, artist pages, "people, not factories."
- **Do** keep Premium Red rare on every screen (≤10%) so it stays a signature, not a theme - no exceptions for hero or closing bands.
- **Do** use Cotton (#FCFCFB) for text on dark and Premium Red surfaces - never #FFFFFF.
- **Do** let a heading earn attention through size and surrounding air. That is the only lever; weight and capitals are not available.
- **Do** keep checkout and admin in the quiet product register: same tokens, minimal expression, zero friction.
- **Do** honor `prefers-reduced-motion` with instant or crossfade alternatives for every transition.

### Don't:
- **Don't** set a heading bold. Weight is how the system used to shout, and it stays at 400; see the Quiet-Heading Rule.
- **Don't** type a heading in caps in the JSX, and don't add `uppercase` to a heading yourself. Case belongs to the ladder class - the top three steps are already caps, the bottom three are deliberately not. See the Caps-Heading Rule.
- **Don't** uppercase a name. Artwork titles and artist names take `.title-name`; those strings are the artist's, not our chrome.
- **Don't** use negative tracking anywhere - no `tracking-tight`, no `-0.0Xem`. See the Constant-Tracking Rule.
- **Don't** invent a new tracking value. It is 0.03em, with exactly two documented exceptions (`.kicker`, the wordmark).
- **Don't** reach for a warm neutral. The light system is neutral now - no cream, no parchment, no `brand-50` fills or `brand-100` borders in chrome. Warm tints are for red-adjacent states only.
- **Don't** add a fourth text tone. Noir for headings, Grey for body, Line for decoration - an `ink/40` is drift.
- **Don't** give a static panel a fill *and* a border *and* a shadow (the Flat-Wall Rule), and don't rest anything in `shadow-lift`.
- **Don't** import the generic-marketplace grammar PRODUCT.md bans: dense commodity grids, badge clutter, discount-screaming banners, urgency timers. Wallmeri never begs.
- **Don't** drift into SaaS-clean minimalism - gradient heroes, identical icon+heading+text feature cards, gradient text.
- **Don't** go craft/artisan cliché - kraft-paper textures, handwritten fonts, rustic twee. Wallmeri is steel.
- **Don't** use Cormorant Garamond outside italic accents, and never more than one accented heading per section.
- **Don't** round a corner - no border-radius anywhere except avatars, count dots, and icon holders. (The reference uses 2px; we keep 0 deliberately.) No colored side-stripe borders or glassmorphism-as-decoration.
- **Don't** put any badge over artwork except the single Premium Red "Featured" pill.
- **Don't** shift the palette toward the deck's full-noir reading in passing - that exploration is deliberate or not at all (see PRODUCT.md).
- **Don't** fill a full section background with Premium Red. There is no red-drenched band anywhere in the system - CTA and closing sections use Cotton/Paper (or Noir) with red confined to a kicker, an accent word, or a button state.

## 7. Divergences from the reference

arteriorshome.com is the reference for *how quietly the type is set*, not a template. These differences are chosen, not oversights, and should not be "fixed" toward the reference:

| | Wallmeri | Reference |
|---|---|---|
| Corner radius | **0** - cut steel is identity | 2px |
| Heading case | **caps** at the top three steps, weight 400 | Title Case (uppercase only on buttons) |
| Accent colour | **Premium Red** at ≤10% | none (red is an error state only) |
| Second typeface | **Cormorant Garamond** italic accent | none - Montserrat only |
| Artwork ratio | **3:4** - posters are portrait | 1:1 |
| Canvas | **#FCFCFB** - the No-Pure-White Rule | #FFFFFF |
| Body grey | **#6B6B6B** - AA on our canvas | #767676 (4.42:1 on ours - fails) |
