---
name: Wallmeri
description: Premium metal wall art marketplace for India — a well-lit gallery in Cotton, Noir, and Premium Red.
colors:
  premium-red: "#b32624"
  deep-red: "#8f1b1a"
  noir-black: "#1b1717"
  cotton: "#faf9f6"
  paper: "#fbfaf4"
  warm-grey: "#5f5852"
  brand-50: "#f8f1ec"
  brand-100: "#f0ded4"
  brand-200: "#e2bfae"
  brand-300: "#cd9379"
  brand-400: "#b05c42"
  brand-800: "#6d1413"
  premium-100: "#f7dedd"
typography:
  heading:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontWeight: 700
    letterSpacing: "-0.01em"
    textTransform: "uppercase"
  accent:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontWeight: 500
    fontStyle: "italic"
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.16em"
    textTransform: "uppercase"
rounded:
  all: "0"
  full: "9999px"
components:
  button-primary:
    backgroundColor: "{colors.noir-black}"
    textColor: "{colors.cotton}"
    rounded: "0"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.premium-red}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.noir-black}"
    borderColor: "{colors.noir-black}"
    rounded: "0"
    height: "44px"
  card:
    backgroundColor: "{colors.paper}"
    rounded: "0"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.noir-black}"
    rounded: "0"
    height: "44px"
  badge:
    backgroundColor: "rgba(27,23,23,0.05)"
    textColor: "{colors.deep-red}"
    rounded: "0"
---

# Design System: Wallmeri

## 1. Overview

**Creative North Star: "The Steel Gallery"**

Wallmeri is a well-lit gallery for metal art. The Cotton canvas (#FAF9F6) is the gallery wall; Noir Black (#1B1717) is the architectural frame — header, footer, hero — that makes the room feel serious; Premium Red (#B32624) is the curator's signature, spent sparingly on actions and emphasis and drenched deliberately on the narrative hero bands. The art itself carries all the energy: big 3:4 artwork tiles, chrome that recedes, no UI element competing with a poster. The system rejects the grammar of the discount marketplace (badge clutter, urgency banners), the sterile SaaS landing page, and the twee craft-shop aesthetic — Wallmeri is steel: modern, precise, permanent.

Density is generous but not empty; this is a shop, not a portfolio. Archivo — bold, uppercase, tightly tracked — is the structural voice of headings, labels, and buttons; Cormorant Garamond appears only as an italic accent (an emphasized word inside a heading, oversized step numerals, quotes) — the engraving on the steel. Shapes are sharp-edged (radius 0) like cut metal; only avatars and count dots stay round. (System updated 2026-07-09 from the Claude Design handoff "Metal Posters E-Commerce Landing".)

**Open question (tracked in PRODUCT.md):** the brand deck argues for a full-noir reading (art glowing on near-black). The current system is its inverse — light gallery, dark frame. Any move toward noir is a deliberate exploration, not a drift.

**Key Characteristics:**
- Art-first: artwork tiles are the largest, brightest elements on any storefront screen.
- Light gallery, dark frame: Cotton canvas bounded by Noir Black structural surfaces.
- One signature accent: Premium Red on ≤10% of a transactional screen — primary buttons, focus rings, the cart count — and drenched on narrative bands.
- Sharp-edged components: radius 0, quiet hairline borders, uppercase tracked labels.
- Two registers: storefront expresses; admin and checkout serve.

## 2. Colors

A three-color identity — Cotton, Premium Red, Noir Black — extended by a warm terracotta-leaning brand ramp for tints and borders.

### Primary
- **Premium Red** (#B32624, `brand-600` = `premium-600`): the single accent voice everywhere. Primary-button hover, focus-visible outlines, text selection, kickers, prices, the featured badge, the cart count dot — and the red-drenched narrative bands (home and About heroes, how-it-works, vision), where it shares the stage with Noir while Cotton stays the majority. Cotton on premium-600 and premium-600 on Cotton are both 6.2:1. (Replaced Cherry Red #810100 and Maroon #630000, retired 2026-07-12 — one red across the whole site.)
- **Deep Red** (#8F1B1A, `brand-700` = `premium-700`): Premium Red's pressed/hover state and emphasis text (errors, danger-adjacent actions, badge text). Never introduced as an independent accent — resting text links and accents use Premium Red (`brand-600`), never Deep Red.
- **On-red tints** (`premium-100` #F7DEDD, `premium-300` #E08F8B): kicker and numeral text on Premium Red drench surfaces.

### Neutral
- **Noir Black** (#1B1717): primary text everywhere, and the structural dark surfaces — sticky header (`bg-ink/95` + backdrop-blur), footer, hero. On dark surfaces, text is Cotton, never white.
- **Cotton** (#FAF9F6): the page canvas (gallery wall) and the text color on all dark or red surfaces.
- **Paper** (#FBFAF4): card and form-field surfaces — a warm near-white one step brighter than the wall.
- **Warm Grey** (#5F5852): secondary text (artist bylines, metadata). AA on both Cotton and Paper; do not lighten it.
- **Brand ramp** (#F8F1EC → #4A0D0C): warm tints for borders (`brand-100`/`brand-200`), hover fills (`brand-50`), focused input borders (`brand-400`), and deep-red pressed states (`brand-800` #6D1413).

### Named Rules
**The Curator's Signature Rule.** Premium Red appears on at most ~10% of any transactional screen. If two red elements compete in one viewport region, one of them is wrong. The red-drenched narrative bands (home/About heroes, how-it-works, vision) are the deliberate exemption.

**The No-Pure-White Rule.** There is no #FFFFFF and no #000000. Light surfaces are Cotton or Paper; dark surfaces are Noir Black; text on dark is Cotton. Pure white artwork tiles are the only permitted exception — the art is exempt from every rule.

## 3. Typography

**Structural Font:** Archivo (with system-ui fallback) — headings, body, labels, buttons
**Accent Font:** Cormorant Garamond (with Georgia fallback) — italic accents only, via `.font-display`

**Character:** Sans-led with a serif flourish. Archivo bold-uppercase-tracked carries all structure — the stamped lettering on steel. Cormorant Garamond appears in medium-weight italic as the single emphasized phrase inside a heading ("Your walls, *elevated.*"), oversized step numerals, and quotes — the engraver's hand.

### Hierarchy
- **Heading** (Archivo 700, uppercase, letter-spacing -0.01em to -0.02em, stepped 24–64px scale across mobile/sm/lg breakpoints — not fluid `clamp()`, to keep every heading rendering at an integer, 8px-aligned pixel size for crisp text at any zoom/DPR): page heroes and section headings; one phrase may switch to the Cormorant italic accent.
- **Kicker** (Archivo 600, 11px, uppercase, tracking 0.28em, Premium Red — `premium-100` on red surfaces): the eyebrow above heroes and dark sections.
- **Title** (Archivo 500–600, 0.875–1rem): card titles, admin table headers, form section titles. Card titles get a slight 0.04em tracking.
- **Body** (Archivo 400, 0.875–1.05rem, leading-relaxed): product copy, descriptions. Cap prose at 65–75ch.
- **Label** (Archivo 600, 11–12px, uppercase, tracking 0.14–0.18em): buttons, nav links, column headings, badges.

### Named Rules
**The Engraving Rule.** Cormorant Garamond appears only in italic, only as an accent — an emphasized phrase in a heading, step numerals, review quotes. It never sets a full heading, button, body paragraph, or form field.

**The Wordmark Rule.** The wordmark is WALLMERI — Archivo 700, tracking 0.24em, no logo tile.

## 4. Elevation

Depth is ambient and state-responsive. Cards rest with `shadow-card` — a barely-there ambient layer whose large soft component is tinted deep red (rgba(143,27,26,0.08)), so shadows feel like the brand's own light, not generic grey. Interaction earns `shadow-lift`. Structural depth comes free from the light/dark architecture: the Noir header and footer bound the Cotton wall without needing shadows at all.

### Shadow Vocabulary
- **Rest** (`box-shadow: 0 1px 2px rgba(27,23,23,0.05), 0 10px 30px rgba(143,27,26,0.08)`): default for cards and elevated surfaces.
- **Lift** (`box-shadow: 0 2px 4px rgba(27,23,23,0.06), 0 16px 40px rgba(143,27,26,0.14)`): hover state on interactive cards (product tiles).

### Named Rules
**The Earned-Lift Rule.** `shadow-lift` appears only in response to interaction (hover, drag, active dialog). Nothing rests in a lifted state.

## 5. Components

Sharp and restrained: radius 0 everywhere (cut steel), quiet hairline borders, uppercase tracked labels. Components never compete with artwork.

### Buttons
- **Shape:** sharp-edged (radius 0), heights 36/44/52px (sm/md/lg), Archivo 600, 11–12px uppercase with 0.16em tracking.
- **Primary:** Noir fill, Cotton text; hover shifts to Premium Red, active to Deep Red.
- **Outline:** transparent fill, Noir text, 1px Noir border; hover inverts to Noir fill with Cotton text.
- **Ghost:** text-only Noir; hover fills ink/5.
- **Danger:** transparent with Deep Red text and border; hover inverts to Deep Red fill.
- **Focus:** global 2px Premium Red `focus-visible` outline, 2px offset. Loading state swaps in a spinner and disables.

### Badge
- **Style:** ink/5 square chip, Deep Red text, 11px uppercase tracked. The "Featured" badge on artwork inverts: Premium Red fill, Cotton text — the only badge allowed on top of art.

### Cards / Containers
- **Corner Style:** sharp (radius 0).
- **Background:** Paper on the Cotton wall, ink/10 hairline border.
- **Shadow Strategy:** rest at `shadow-card`; interactive cards lift on hover (see Elevation).
- **Product card:** frameless — a bare 3:4 artwork tile (whole tile rises 6px over 300ms on hover), then title (Archivo 500, slight tracking) with price in Premium Red on the same baseline row, artist byline in Warm Grey with a text "Add to cart" link, star rating.
- **Hero frame:** the featured artwork sits inside a Noir frame (14px padding) with a deep 60px drop shadow — the one framed piece in the gallery.

### Inputs / Fields
- **Style:** Paper fill, ink/20 border, radius 0, 44px height, Archivo 0.875rem.
- **Focus:** border darkens to Noir (plus the global red focus outline). Placeholder is Warm Grey at 70%.
- **Error:** message below the field in Deep Red (`FieldError`); labels are Archivo 500, 0.875rem, above the field.

### Navigation
- **Header:** sticky Cotton at 95% opacity with backdrop-blur, hairline ink/10 bottom border, 72px tall. Three-part layout: nav links left, WALLMERI wordmark centered, utilities (Search / Login / Cart (n)) right — all Archivo 500, 12px uppercase with 0.14em tracking, hover to Premium Red. Search is a toggled full-width row beneath the bar.
- **Footer:** Noir. Wordmark + one-line tagline left; uppercase column headings with 14px Cotton/65 links right; hairline-separated © line.

## 6. Do's and Don'ts

### Do:
- **Do** let the artwork be the largest, brightest thing on every storefront screen; chrome recedes.
- **Do** weave artist attribution through the flow — bylines on cards, artist pages, "people, not factories."
- **Do** keep Premium Red rare on transactional screens (≤10% per screen) so it stays a signature, not a theme; drench it only on the named narrative bands.
- **Do** use Cotton (#FAF9F6) for text on dark and Premium Red surfaces — never #FFFFFF.
- **Do** keep checkout and admin in the quiet product register: same tokens, minimal expression, zero friction.
- **Do** honor `prefers-reduced-motion` with instant or crossfade alternatives for every transition.

### Don't:
- **Don't** import the generic-marketplace grammar PRODUCT.md bans: dense commodity grids, badge clutter, discount-screaming banners, urgency timers. Wallmeri never begs.
- **Don't** drift into SaaS-clean minimalism — gradient heroes, identical icon+heading+text feature cards, gradient text.
- **Don't** go craft/artisan cliché — kraft-paper textures, handwritten fonts, rustic twee. Wallmeri is steel.
- **Don't** use Cormorant Garamond outside italic accents (emphasized heading phrases, numerals, quotes).
- **Don't** round a corner — no border-radius anywhere except avatars and count dots. No colored side-stripe borders or glassmorphism-as-decoration.
- **Don't** put any badge over artwork except the single Premium Red "Featured" pill.
- **Don't** shift the palette toward the deck's full-noir reading in passing — that exploration is deliberate or not at all (see PRODUCT.md).
