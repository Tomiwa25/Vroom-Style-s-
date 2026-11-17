# Vroom Styles — Haute Warmth Design System (DESIGN.md)

---
name: Haute Warmth
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0edec'
  surface-container-high: '#ebe7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#56423d'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#89726b'
  outline-variant: '#dcc1b9'
  surface-tint: '#9d4324'
  primary: '#893417'
  on-primary: '#ffffff'
  primary-container: '#a84b2c'
  on-primary-container: '#ffe0d7'
  inverse-primary: '#ffb59e'
  secondary: '#635d58'
  on-secondary: '#ffffff'
  secondary-container: '#eae1da'
  on-secondary-container: '#69635e'
  tertiary: '#504f4c'
  on-tertiary: '#ffffff'
  tertiary-container: '#696763'
  on-tertiary-container: '#eae6e1'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-xl:
    fontFamily: Bodoni Moda
    fontSize: 5rem
    fontWeight: '400'
    lineHeight: 5.25rem
    letterSpacing: -0.03em
  display-lg:
    fontFamily: Bodoni Moda
    fontSize: 3.75rem
    fontWeight: '400'
    lineHeight: 4.25rem
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Bodoni Moda
    fontSize: 2.5rem
    fontWeight: '400'
    lineHeight: 3rem
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Bodoni Moda
    fontSize: 1.875rem
    fontWeight: '500'
    lineHeight: 2.375rem
    letterSpacing: '0'
  headline-sm:
    fontFamily: Bodoni Moda
    fontSize: 1.375rem
    fontWeight: '500'
    lineHeight: 1.875rem
    letterSpacing: 0.01em
  body-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.125rem
    fontWeight: '300'
    lineHeight: 1.875rem
    letterSpacing: '0'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.625rem
    letterSpacing: '0'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.45rem
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: 1rem
    letterSpacing: 0.12em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.6875rem
    fontWeight: '500'
    lineHeight: 0.875rem
    letterSpacing: 0.16em
spacing:
  gutter: 1.5rem
  gutter-desktop: 2.5rem
  margin: 1.25rem
  margin-desktop: 4rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 2rem
  space-xl: 4rem
---

## Brand & Style Philosophy

This design system expresses modern haute couture curation. It treats digital retail not as a transactional catalog, but as an intimate, tactile salon walkthrough. The brand personality is poised, discerning, architectural, and serene. It speaks to fashion-forward connoisseurs and apparel collectors who value silhouette, materiality, and deliberate restraint over fast-fashion velocity.

The aesthetic philosophy draws heavily from modern **high-fashion editorial print** combined with **warm minimalism**:
- **Generous Spatial Breaths:** Negative space is treated as an active luxury texture, mimicking the wide margins of limited-run biannual fashion periodicals.
- **Architectural Typography:** Extreme tension between high-contrast, editorial Didone serifs and pristine, understated modern grotesques.
- **Physical Materiality:** Interfaces avoid glossy tech tropes, leaning into organic linen textures, delicate basting-stitch dividers, and warm, tactile tone-on-tone layering.
- **Intentional Restraint:** Every embellishment must justify its presence. Unadorned typography, strict geometric discipline, and raw photographic imagery take absolute precedence over synthetic UI ornaments.

## Colors & Roles

The palette reproduces the tactile environment of an atelier cutting room. Light is filtered, natural, and soft, anchored by raw textiles, deep ink pigments, and artisan terracotta dye.

- **Canvas (`#FAF8F5` / `#FCF9F8` Warm Ecru):** The ambient baseline for the viewport. Preserves visual warmth and tactile texture.
- **Surface Pure (`#FFFFFF` Pure Silk):** Reserved exclusively for elevated structural cards, floating panels, and product detail viewports.
- **Surface Secondary (`#F3EFEA` / `#F0EDEC` Oat Wash):** Neutral fill used for contextual drawers, inset modules, filter panels, and soft metadata tags.
- **Ink Primary (`#111111` / `#1C1B1B` Deep Obsidian):** High-density charcoal-black used for headlines, key CTAs, and structural framing.
- **Ink Secondary (`#4D4843` / `#56423D` Espresso Slate):** Used for running editorial body copy, metadata, and sub-captions.
- **Accent (`#A84B2C` / `#893417` Warm Terracotta Atelier):** Applied with disciplined restraint. Denotes active states, seasonal highlights, runway badges, and critical interactive anchors.
- **Hairline Borders (`#EBE6DF` / `#DCC1B9` Textile Hairline):** Low-contrast structural borders that define grid divisions without interrupting visual flow.

## Typography Hierarchy

- **Display & Headlines (`Bodoni Moda`):** Set regular or medium weights. Never artificially bold. Punctuation in titles is omitted in favor of structural whitespace.
- **Body (`Plus Jakarta Sans`):** Styled light (`300`) to regular (`400`) with generous line-heights (`1.6`–`1.8`) to replicate luxury editorial column pacing.
- **Labels & Micro-UI (`Plus Jakarta Sans`):** Always transformed to uppercase with deliberate tracking (`0.12em`–`0.16em`). Used for SKU references, material breakdown, sizing chips, tab indicators, and button text.

## Shapes & Components

- **Sharp Edges (0px – 4px):** Buttons, image frames, input containers, modal sheets, and cards retain crisp architectural corners.
- **Primary Button:** Solid `#111111` fill with `#FFFFFF` text. Sharp corners, uppercase `label-md` typography. Hover transitions to `#A84B2C` (Warm Terracotta).
- **Secondary / Outline:** Transparent fill, `#111111` 1px border. On hover, fills with `#F3EFEA`.
- **Product Cards:** Strict aspect ratios `3:4` or `4:5`. `#FFFFFF` ground with `#EBE6DF` 1px outer perimeter. Subtle hover zoom (`scale(1.02)`).
- **Size Selectors:** Square tiles (`44px x 44px`) with 1px border.
- **Fabric & Composition Badge:** Displays textile origin, weave weight (GSM), and organic certification markers.
