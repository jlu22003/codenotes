---
name: Justin Lu — Portfolio
description: A restrained, fact-driven design system for a dual build/run engineering portfolio — quiet neutrals, one warm accent, technical type for what's provable.
colors:
  burnt-umber: "oklch(0.4341 0.0750 44.3600)"
  burnt-umber-foreground: "oklch(1.0000 0 0)"
  sandpaper-tan: "oklch(0.9200 0.0651 74.3695)"
  sandpaper-tan-foreground: "oklch(0.3499 0.0685 40.8288)"
  paper-white: "oklch(0.9821 0 0)"
  page-white: "oklch(0.9911 0 0)"
  ink-charcoal: "oklch(0.2435 0 0)"
  soft-gray: "oklch(0.9521 0 0)"
  pencil-gray: "oklch(0.5032 0 0)"
  margin-gray: "oklch(0.9310 0 0)"
  hairline-gray: "oklch(0.8822 0 0)"
  alert-red: "oklch(0.6271 0.1936 33.3390)"
typography:
  display:
    fontFamily: "Montserrat, system-ui, -apple-system, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Montserrat, system-ui, -apple-system, sans-serif"
    fontWeight: 700
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Roboto, system-ui, -apple-system, sans-serif"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontWeight: 400
    letterSpacing: "0em"
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.625rem"
  xl: "0.75rem"
  2xl: "1rem"
  3xl: "1.5rem"
  4xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.burnt-umber}"
    textColor: "{colors.burnt-umber-foreground}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    height: "2.25rem"
  button-primary-hover:
    backgroundColor: "oklch(0.4341 0.0750 44.3600 / 0.9)"
  button-outline:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink-charcoal}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    height: "2.25rem"
  button-secondary:
    backgroundColor: "{colors.sandpaper-tan}"
    textColor: "{colors.sandpaper-tan-foreground}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    height: "2.25rem"
  badge-default:
    backgroundColor: "{colors.burnt-umber}"
    textColor: "{colors.burnt-umber-foreground}"
    rounded: "9999px"
    padding: "0.125rem 0.5rem"
  card:
    backgroundColor: "{colors.page-white}"
    textColor: "{colors.ink-charcoal}"
    rounded: "{rounded.xl}"
    padding: "1.5rem"
---

# Design System: Justin Lu — Portfolio

## Overview

**Creative North Star: "The Field Notebook"**

The portfolio reads like a technical logbook kept by someone who has actually been on call: quiet neutral pages, facts set in monospace, and exactly one warm ink color reserved for the few things that ask for action. Nothing is decorated for its own sake — the restraint is the point, because the audience (hiring managers and freelance clients) is here to judge whether this person can build and run real software, not whether he can design a flashy page.

The palette stays almost entirely achromatic — near-white pages, near-black ink, a handful of gray steps for hierarchy — so that Burnt Umber, the single warm accent, reads as a deliberate signal every time it appears: a link, a button, a focus ring, an active tab. Motion follows the same discipline: nearly everything is feedback (hover states, spring-following cursor, scroll response) rather than decoration, with exactly one confirmed exception — the hero's WebGL particle sphere — which earns its atmosphere because it was chosen as the site's one deliberate signature, not defaulted into as ornament.

This is not a glassy SaaS-marketing aesthetic: no gradients, no glassmorphism, no multi-hue accent systems, no heavy card shadows. It sits closer to well-kept internal documentation than a landing page — quietly warm rather than quiet-and-cold, because of the one accent color and the sphere.

**Key Characteristics:**
- Achromatic-first palette with a single reserved warm accent (Burnt Umber)
- JetBrains Mono exclusively for verifiable facts — stats, dates, tags, code — never for prose or headings
- Flat-at-rest surfaces; shadow appears only to mark a real boundary, never for lift or drama
- One confirmed motion exception (the hero particle sphere); everything else is state feedback and respects `prefers-reduced-motion`

## Colors

Nearly achromatic (chroma ≈ 0) neutrals carry the page; a single warm, low-chroma hue does all of the accent work. Values below are light mode (the default); dark mode swaps each role to its own OKLCH pair defined in `.dark`, preserved in the sidecar rather than restated here. The accent's hue (44.36) is now shared across both themes — dark mode previously carried an unrelated hue (66.17) left over from an earlier palette generation; it's been rotated to match so the brand color reads as one consistent hue, just lighter in dark mode, not a different color.

### Primary
- **Burnt Umber** (`oklch(0.4341 0.0750 44.3600)`): the site's only non-neutral hue — refreshed from an earlier, flatter value (`oklch(0.4341 0.0392 41.9938)`) to read richer and more confident at the same lightness, so contrast is unaffected (still 7.7-8.1:1 across every real usage). Hue inspired by the "Mocha Mousse" shadcn community theme, re-derived at this project's own lightness since the stock theme's lighter value fails contrast here. Used exclusively for interactive and functional elements — primary buttons, links, focus rings, active states. Never used decoratively.

### Secondary
- **Sandpaper Tan** (`oklch(0.9200 0.0651 74.3695)`): a lighter, warmer neutral-adjacent tone used for secondary buttons and low-emphasis accent surfaces where Burnt Umber would be too heavy.

### Neutral
- **Paper White** (`oklch(0.9821 0 0)`): page background.
- **Page White** (`oklch(0.9911 0 0)`): card, popover, and other raised-surface background — very slightly lighter than the page itself.
- **Ink Charcoal** (`oklch(0.2435 0 0)`): primary text color, on both page and card surfaces.
- **Soft Gray** (`oklch(0.9521 0 0)`): muted backgrounds (e.g. subtle section fills).
- **Pencil Gray** (`oklch(0.5032 0 0)`): secondary/muted text — captions, metadata, de-emphasized copy.
- **Margin Gray** (`oklch(0.9310 0 0)`): accent-neutral background for hover/active states on non-primary elements.
- **Hairline Gray** (`oklch(0.8822 0 0)`): borders, dividers, input outlines. Always thin (1px), never heavy.

### Functional
- **Alert Red** (`oklch(0.6271 0.1936 33.3390)`): destructive/error states only (form validation, delete actions). Not part of the brand palette — reserved strictly for system feedback.
- **Passive confirmations (success banners, status messages) use neutral tones, not Burnt Umber.** The accent is reserved for interactive/functional elements per the One Voice Rule; a success message isn't one. Error gets its own dedicated hue because it demands attention — success doesn't need to compete for it.

### Named Rules
**The One Voice Rule.** Burnt Umber is the only non-neutral color in the system. It appears on a small minority of any given screen — a button, a link, a ring — and its rarity is what makes it read as a signal instead of decoration. A second accent hue is never introduced without retiring this rule deliberately.

## Typography

**Display/Headline Font:** Montserrat (with system-ui, -apple-system fallback)
**Body Font:** Roboto (with system-ui, -apple-system fallback)
**Label/Mono Font:** JetBrains Mono (with ui-monospace fallback)

**Character:** Montserrat carries authority in short bursts (headings only, tight tracking); Roboto is the quiet workhorse for anything meant to be read at length; JetBrains Mono exists purely to mark a claim as a verifiable fact rather than prose.

### Hierarchy
- **Display** (800, 2.25rem base, 1.1 line-height, −0.02em tracking): hero `h1` only.
- **Headline** (700, −0.02em tracking): `h2` section titles.
- **Title** (700, −0.02em tracking): `h3`–`h6`, card and subsection titles — same weight/tracking family as Headline, one step down in size.
- **Body** (400 Roboto, 1.5 line-height): all prose — descriptions, project summaries, form copy.
- **Label** (400–500 JetBrains Mono): tags, category badges, dates, stats, code references. Small size, no case transform.

### Named Rules
**The Mono-for-Facts Rule.** JetBrains Mono is reserved for content that is verifiable — a number, a date, a tag, a piece of code. It never appears in narrative prose or headings; the moment mono type shows up, the reader should trust it's a fact, not a stylistic choice.

## Layout

Content sits in a centered `max-w-7xl` container with `px-8` side padding — the homepage cancels Nextra's own ambient article padding (`-mx-4 md:-mx-12` wrapper) so `px-8` is the only side inset actually in effect, rather than the two stacking. Major sections use a consistent `py-24` vertical rhythm, with section headers separated from their content by `mb-16` and sub-headers by `mb-4`. Between-section `SectionDivider`s add a small `py-6` of their own on top of that rhythm — deliberately less than the flanking sections' own `py-24`, so the seam reads as a pause, not a second rhythm layer. Grids (project cards, focus cards, skills) use `gap-8`. The layout is single-column at the section level — no sidebar chrome on marketing surfaces — with Nextra's docs sidebar/TOC reserved for project write-up pages only. A `StatusLine` (32px, mono, muted) renders once directly under the navbar at the top of every page — it is not sticky and scrolls away with the rest of the content; only the navbar itself stays fixed during scroll.

## Elevation & Depth

Flat by default. Surfaces sit flush with the page at rest — there is no ambient drop-shadow system and no tonal-layering scheme standing in for it. The one shadow in regular use (`shadow-sm` on cards, `shadow-xs` on outline buttons) is faint enough to read as a boundary cue, not as lift.

### Shadow Vocabulary
- **Card boundary** (`shadow-sm`): the only shadow most surfaces ever use — separates a card from the page behind it.
- **Outline-button edge** (`shadow-xs`): fainter still; exists only so an outline button reads as a surface, not just a border.

### Named Rules
**The Flat-at-Rest Rule.** Nothing is elevated by default. A shadow's presence always means "this is a distinct surface," never "this is important" — importance is carried by the Burnt Umber accent, not by lift.

## Shapes

Corners are moderate and consistent rather than sharp or pill-shaped by default: a `0.375rem`–`0.75rem` radius scale (`sm` through `xl`) covers nearly everything — buttons and inputs at the small end, cards at `xl` (`0.75rem`). The scale extends to `2xl`–`4xl` (`1rem`–`2rem`) for occasional larger surfaces. The one deliberate exception is badges/tags, which are fully pill-shaped (`rounded-full`) to visually distinguish them as labels rather than containers. Borders are always hairline (1px, Hairline Gray) — never bold or colored except on destructive/error states.

## Components

### Buttons
- **Shape:** `rounded-md` (0.5rem), height `2.25rem` (default size), `0.5rem 1rem` padding.
- **Primary:** Burnt Umber background, white text; hover darkens to 90% opacity.
- **Secondary:** Sandpaper Tan background, its paired dark-brown foreground text; hover to 80% opacity.
- **Outline:** transparent/page background, hairline border, `shadow-xs`; hover fills with Margin Gray.
- **Ghost:** no background or border at rest; hover fills with Margin Gray.
- **Link:** Burnt Umber text, underline only on hover.
- **Focus:** a 3px `ring-ring/50` ring plus a solid focus border — visible, never suppressed.

### Chips / Tags
- **Style:** pill-shaped (`rounded-full`), `0.125rem 0.5rem` padding, small (`text-xs`) JetBrains Mono type.
- **Use:** project category badges and tech-stack tags (rendered in the Nextra TOC sidebar on project pages) — always Burnt Umber default or a neutral outline variant, never a rainbow of category colors.

### Cards / Containers
- **Corner Style:** `rounded-xl` (0.75rem).
- **Background:** Page White, hairline border.
- **Shadow Strategy:** `shadow-sm` only — see Elevation.
- **Internal Padding:** `py-6` outer, `px-6` per content block.

### Inputs / Fields
- **Style:** hairline border, page background, same radius family as buttons.
- **Focus:** border shifts to the focus ring color plus the shared 3px ring treatment.
- **Error:** border and ring shift to Alert Red (`aria-invalid` state) — the one place a second hue is permitted, because it's system feedback, not brand color.

### Navigation
- **Style:** Nextra's default navbar, restyled to the neutral palette (background/border tokens), sitting above the custom `StatusLine` strip (mono, muted-foreground, no border, 32px tall, present on every page).

### Particle Sphere (signature component)
The hero's WebGL particle field is the system's one sanctioned decorative element. ~1,400 randomized points on a thin spherical shell, rendered as soft dots in Ink Charcoal, gently rotating; it trails the cursor via a damped spring and displaces outward along independent random vectors as a continuous function of scroll speed, easing back to rest as scrolling slows. It is `aria-hidden` and fully skipped under `prefers-reduced-motion` (renders one static frame instead of animating) — the one place atmosphere is allowed to outrank restraint, and only because it was chosen deliberately as the site's signature rather than defaulted into.

## Do's and Don'ts

### Do:
- **Do** keep Burnt Umber reserved for interactive/functional elements only — buttons, links, focus rings, active states.
- **Do** set every verifiable fact (stats, dates, tags, code) in JetBrains Mono; keep it out of prose and headings.
- **Do** keep surfaces flat at rest; let `shadow-sm`/`shadow-xs` mark a boundary, never a lift.
- **Do** route every new animated element through `prefers-reduced-motion`, exactly like the hero sphere and marquee already do.

### Don't:
- **Don't** introduce a second brand accent hue — Alert Red is functional-only and must stay that way.
- **Don't** add gradients, glassmorphism, or heavy card shadows — they read as generic-portfolio, which this system is deliberately built to avoid.
- **Don't** use JetBrains Mono for narrative copy, or Montserrat below the heading level — each font's role is a trust signal, not just a style choice.
- **Don't** add a second atmospheric/decorative motion element without deliberately retiring the "one signature" rule the particle sphere currently holds alone.
