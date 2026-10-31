---
name: Flora Egypt
description: A boutique counter for women's leather shoes and bags, cocoa slabs, gold hairlines, framed photography.
colors:
  cocoa: "#6b4423"
  cocoa-raised: "#573719"
  ribbon: "#7a5f3b"
  gold: "#c9a24a"
  gold-hover: "#d9b45c"
  terracotta-rose: "#8b6f47"
  greige-ivory: "#faf9f6"
  sand: "#f5f5dc"
  card-ivory: "#faf7f3"
  muted-sand: "#e4dbd0"
  cocoa-text-soft: "#5f4b40"
  ivory-on-cocoa: "#f6f1ea"
  destructive: "#d4183d"
typography:
  display-en:
    fontFamily: "Jost, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 6vw, 5.5rem)"
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: "0.015em"
  display-ar:
    fontFamily: "Gess, sans-serif"
    fontSize: "clamp(2.6rem, 6vw, 5.5rem)"
    fontWeight: 300
    lineHeight: 1.35
  section-title:
    fontFamily: "Jost / Gess"
    fontSize: "1.875rem"
    fontWeight: 300
    lineHeight: 1.1
  body:
    fontFamily: "Jost, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.9
  label:
    fontFamily: "Jost / Gess"
    fontSize: "0.875rem"
    fontWeight: 500
    letterSpacing: "0.02em"
rounded:
  base: "0.25rem"
  none: "0"
spacing:
  section-y: "5rem"
  section-y-md: "7rem"
  gutter: "1rem"
  frame-offset: "14px"
components:
  button-gold:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.cocoa}"
    rounded: "{rounded.none}"
    padding: "0 1.75rem"
    height: "3rem"
  button-gold-hover:
    backgroundColor: "{colors.gold-hover}"
  control-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ivory-on-cocoa}"
    size: "2.75rem"
  control-ghost-hover:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.cocoa}"
  stat-card:
    backgroundColor: "{colors.cocoa-raised}"
    textColor: "{colors.ivory-on-cocoa}"
    padding: "2rem 1.75rem"
  category-tile-mat:
    backgroundColor: "{colors.greige-ivory}"
    padding: "0.75rem"
  announcement-strip:
    backgroundColor: "{colors.ribbon}"
    textColor: "{colors.ivory-on-cocoa}"
---

# Design System: Flora Egypt

Scope: this is the homepage-scoped system, derived from the built homepage (`app/[lang]/page.tsx` and its components). Product, cart, checkout and dashboard pages inherit the changed global tokens (palette, 0.25rem radius, Jost) but have not been redesigned or reviewed against it.

## Overview

**Creative North Star: "The Boutique Counter"**

Flora reads as a quiet counter in a leather boutique, not a catalogue. Deep cocoa slabs (nav, hero, stats band, footer) hold the gold wordmark and a single light headline; every product photo sits in a fixed 4:5 frame like a piece laid on velvet. Between the slabs, a greige-ivory ground stays calm and unbusy. Luxurious and calm is the owner's pinned brief, and the build delivers it through restraint: one accent metal, hairlines, sharp corners.

The system is Arabic-first (RTL default, Gess for display) with Latin as the equal-quality second language (Jost, uppercase, open tracking). Layout uses logical properties and explicit `[dir="rtl"]` overrides where geometry has a direction (frame offset, arrow nudge, tile underline origin, arc tilt).

The recognisable silhouette with content removed: a cocoa slab, a gold hairline offset behind a framed photo, a tilted arc of dark cards.

**Key Characteristics:**
- Cocoa slabs alternate with a greige-ivory ground; gold appears only on cocoa.
- Depth by 1px hairline and tonal step (cocoa to cocoa-raised), not by shadow.
- Photography is always framed: offset hairline in the hero, a mat on tiles.
- One authored entrance (hero) and one scroll settle (stats arc); everything else is still.
- Light display weight (300), sharp near-square corners.

## Colors

A warm, low-chroma brown-and-ivory palette with a single metal accent.

### Primary
- **Cocoa** (`{colors.cocoa}`): nav, hero, stats band, footer fields; all body text on ivory; primary button text on gold.
- **Cocoa Raised** (`{colors.cocoa-raised}`): one tonal step up from cocoa; stat cards and the monogram frame placeholder.

### Secondary
- **Logo Gold** (`{colors.gold}`): the wordmark colour. Wordmark, primary CTA fill, hairlines, stat numerals, hover states, text selection. Hover fill `{colors.gold-hover}`.
- **Terracotta Rose** (`{colors.terracotta-rose}`): focus ring, scrollbar, tile-label underline on hover; the only accent permitted on ivory.
- **Ribbon** (`{colors.ribbon}`): the announcement marquee strip only.

### Neutral
- **Greige Ivory** (`{colors.greige-ivory}`): page ground. **Card Ivory** (`{colors.card-ivory}`): cards and input fill. **Sand** (`{colors.sand}`) and **Muted Sand** (`{colors.muted-sand}`): image placeholders, secondary surfaces.
- **Soft Cocoa** (`{colors.cocoa-text-soft}`): muted body text on ivory.
- **Ivory on Cocoa** (`{colors.ivory-on-cocoa}`): text on cocoa fields, at 70-90% alpha for secondary copy.
- Hairline border: cocoa at 14% alpha (`--border`). Destructive (`{colors.destructive}`) is a system state colour only.

### Named Rules
**The Gold-On-Cocoa Rule.** Gold is used only on cocoa (or ribbon) fields. On ivory it fails contrast; on ivory use cocoa, with terracotta rose for hover and hairline accents.

**The One Metal Rule.** Gold is the only accent metal; it is never mixed with a second saturated hue on the same slab.

## Typography

**Display Font:** Jost light (Latin, via next/font, weights 300/400/500) and Gess Light (Arabic, local OTF, 300/500/700)
**Body Font:** Jost for Latin; Gess for Arabic text where the page applies it explicitly
**Label Font:** same families, weight 500

**Character:** Jost's geometric lightness in capitals gives Latin headlines an airy, tailored feel; Gess at light weight with generous leading gives Arabic the same calm. The two are tuned per language rather than mirrored.

### Hierarchy
- **Display** (300, clamp(2.6rem, 6vw, 5.5rem), 1.1 Latin / 1.35 Arabic): hero headline only. Latin uppercase at 0.015em tracking; text-wrap balance.
- **Section title** (300, 1.875rem on mobile to 3rem on desktop; larger 3rem to 3.75rem for the about headline): heading followed by a hairline rule.
- **Body** (400, 1.125rem, 1.9 leading, max-w-prose): about copy in soft cocoa.
- **Stat numeral** (300, 3rem to 3.75rem, tabular figures, gold): on stat cards.
- **Label** (500, 0.875rem to 1rem, 0.02em tracking): buttons, nav utilities, marquee (sm, wide tracking). Not uppercased in Arabic.

### Named Rules
**The Per-Language Display Rule.** Arabic and Latin display styles are separate (`lang` attribute), never one style with the font swapped. Latin is caps with tracking; Arabic is never uppercased or letter-spaced and gets taller leading.

## Layout

Container is centred with 1rem to 2rem side padding. Sections take 5rem vertical padding on mobile and 7rem from md. Hero is a two-column grid from lg (text at the reading start, framed image at the reading end, image capped at 28rem), with a 3rem to 4rem gap, min height min(44rem, 100svh minus 6.5rem). Categories are 2 columns on mobile, 3 from md, with generous row gaps (2.5rem to 3.5rem). About is a 1fr / 1.4fr split from md. Nav is a three-column grid (links, centred wordmark, utilities) 4.25rem tall. Stats are one column on phones (staggered, gently tilted, 90% wide) and a three-up arc from 768px with outer cards dropped 2.25rem and tilted 6 degrees (mirrored in RTL). Use logical properties (`ms`, `me`, `ps`, `-end`, `margin-inline-start`); physical left/right only inside `[dir]` overrides.

## Elevation & Depth

Flat by default. Depth is carried by 1px hairlines (cocoa at 14% on ivory; ivory at 10-28% or gold at 28% on cocoa) and tonal steps between cocoa and cocoa-raised. No resting shadows are used on the light ground.

### Named Rules
**The Hairline Instead Of Shadow Rule.** Separate and lift with a 1px line or a tonal step, never a drop shadow.

## Shapes

Near-square. Base radius is 0.25rem (`--radius`), but the homepage buttons, frames, tiles and cards render at 0. Round forms are limited to the small bag-count badge. Framing is the recurring geometry: a gold 1px hairline offset 14px down and toward the reading end behind the hero photo (70% opacity; mirrored in RTL), and a 1px cocoa/15% mat with 0.5rem to 0.75rem padding around every category tile image. All photography is 4:5 with object-cover.

## Components

### Buttons
- **Primary (gold):** gold fill, cocoa text, 3rem min height, 1.75rem inline padding, weight 500, 0.02em tracking, arrow glyph on the end. Hover lifts to the lighter gold and nudges the arrow 4px toward the reading direction (mirrored in RTL). Only on cocoa fields.
- **Control (ghost):** 2.75rem square, 1px ivory/28% border, transparent. Hover fills gold with cocoa icon. Used for hero prev/next.

### Cards / Containers
- **Category tile:** mat (1px cocoa/15% border, padding) around a 4:5 sand-backed image; image scales to 1.04 on hover over 1.2s; label underline in terracotta rose wipes in from the reading start on hover.
- **Stat card:** cocoa-raised fill, 1px gold/28% border, 2rem 1.75rem padding, centred gold numeral over ivory/75% caption. Cards settle from flat onto their tilt when the section scrolls into view.

### Navigation
Cocoa bar with a 1px ivory/10% bottom border. Centred gold wordmark, links at the reading start, wishlist, bag (with gold count badge) and user at the end; icons hover to gold. Language switch is a bordered small button in Gess. Announcement strip above in ribbon with a slow marquee, gold diamond separators, small ivory text.

### Hero entrance (signature)
One authored entrance: headline, subcopy and CTA rise 20px with fade over 1s (staggered by `--d`), while the framed image opens by clip-path wipe over 1.2s, all on cubic-bezier(0.16, 1, 0.3, 1). Reduced motion removes it.

## Do's and Don'ts

### Do:
- **Do** put gold only on cocoa or ribbon fields; use cocoa text on ivory.
- **Do** separate with 1px hairlines and tonal steps.
- **Do** frame every photograph (4:5; offset gold hairline on cocoa, hairline mat on ivory).
- **Do** keep a single entrance (hero) and the stats settle-on-scroll; honour `prefers-reduced-motion`.
- **Do** write RTL first, use logical properties, and add `[dir="rtl"]` overrides for directional geometry.
- **Do** give Arabic its own display treatment (Gess 300, 1.35 leading, no caps or tracking).
- **Do** open section headings as a heading plus a hairline rule.

### Don't:
- **Don't** use gold text or fills on ivory, sand or white.
- **Don't** add drop shadows to cards, buttons or images.
- **Don't** build icon-heading-text card grids or centre-everything section stacks.
- **Don't** put kickers, eyebrows or small-caps lead-ins above headings.
- **Don't** add decorative entrance animation to sections beyond the hero and the stats arc.
- **Don't** use physical left/right spacing or alignment outside `[dir]` overrides.

### Observed but not canonized
The `.fl-arc-card` drop shadow was removed after documentation, so the build now matches the hairline rule. Other pages (product, cart, checkout, dashboard) still use pre-redesign component styling and are unreviewed.


## Palette revision

The owner asked for the site's original colours instead of the darker cocoa first built. Current source of truth is `app/globals.css`: primary brown `#6b4423`, text `#3d2817`, ground `#faf9f6`, sand `#f5f5dc`, accent `#8b6f47`, ribbon `#7a5f3b`, raised card `#573719`, logo gold `#c9a24a`. Gold text is large-size only on this brown (about 3.4:1); small text on brown is ivory.

## Typeface revision

Gess (commercial licence unverified) and the first Jost-only pairing were replaced. Current faces, loaded with `next/font/google` in `app/layout.tsx`: **Marcellus** (English display, uppercase, +0.04em tracking, echoes the engraved wordmark), **El Messiri** (Arabic display, 400-600), **Tajawal** (Arabic text; the old `font-gess` class now resolves to it), **Jost** (English text and numerals). Source of truth: `app/globals.css` (`--font-gess`, `--font-display-ar`, `--font-display-en`) and `home.css` (`.fl-display`). The unused Gess `.otf` files remain in `public/fonts` and can be deleted.

## Hero states

Offers are finished 4:5 posters (about 1080x1350) made outside the site, with their own text, dates and call to action. The hero therefore shows each poster whole (`object-contain`, never cropped), makes it the link to the shop, and adds no caption that repeats its words; only prev/next controls appear when there is more than one. With no active offer the frame shows a collage of the home categories (one, two or three tiles, each linking to its category); with no categories it shows the wordmark. No "no offers" message is ever shown to customers. Design offer posters in the site palette (brown `#6b4423`, ivory `#faf9f6`, gold `#c9a24a`) so they sit calmly inside the frame.

## Storefront structure (home)

Order: announcement ribbon, brown nav, hero (offer poster or category collage), **trust strip**, **categories as arched frames**, **featured products**, story, stats band, reels (only if any), footer.

- **Trust strip** (`TrustStrip.tsx`): one slim sand strip with hairline dividers, icon plus label only. Contains only owner-confirmed promises: WhatsApp support, cash on delivery, delivery to all governorates, exchange or return. Add nothing the owner has not confirmed.
- **Categories** (`HomeCategoriesPageClient`): a compact row of arch-topped frames (`.fl-arch`, `.fl-arch-mat`), horizontal snap-scroll on phones, centred on desktop. The arch is the one place the 0-radius rule bends.
- **Featured products** (`HomeProducts.tsx`): server-fetched, featured first then newest, active products with a photo, max 8. 4:5 photo in a hairline mat, name, price (struck base price only when `finalPrice < basePrice`), a "New" or "Out of stock" tag. Cards link to the product page; cart logic stays on the product page.

## Final home structure and motion (supersedes "Hero states" and "Storefront structure" above)

Order: announcement ribbon, brown nav, **hero** (real large logo from `public/images/logo-large.png`, the slogan, shop and categories actions, three category photos, the four promises as a ticker; it never depends on offers), **offers section** (own section, hidden when there are no active offers; one offer = poster beside its text, several = poster row), categories as arches, featured products, story, stats band, reels (only if any), footer. The hero shows a small "Current offers" pointer only when an offer is active.

**Rounded:** `999px` is intentional and limited to the category arches (`.fl-arch`, `.fl-arch-mat`) and pill-shaped buttons (`.fl-btn-oval`, category pills); everything else stays at 0 or the 0.25rem token.

**Motion (calm level):** one gold glint crosses the logo once (`.fl-glint`, masked to the logo); the hero rises in with one stagger; elsewhere a single scroll reveal (`Reveal.tsx`: rise, fade or scale, staggered by index) releases elements the first time they enter the viewport. Elements already on screen are never hidden, and with reduced motion or no JS everything is visible. Pages fade in on navigation (`app/template.tsx`, opacity only). Product cards swap to a second photo on hover when one exists. Only `transform` and `opacity` animate.

## Hero decision (latest, supersedes the "Final home structure" hero text)

The hero never shows a large logo (the nav already carries it). **The offer is the hero when there is one:** one framed 4:5 picture (gold hairline offset) at the reading end shows the offer poster whole and uncropped, linking to the shop, with several offers rotating and the offer's facts (details, end date) as real text below. **With no active offer** the same frame shows the home categories as a moving collage (one large and two small tiles that slowly zoom and cross-fade through all categories, label and link following the photo). Slogan (word-by-word rise), shop and categories actions, and the four promises ticker are identical in both states. There is no separate offers section; `OffersSection`, the big logo and its glint were removed. Source: `Offers/HomeHero.tsx`, `Offers/HeroBand.tsx`, `categoryMeta.ts`.

## Hero behaviour (spotlight, current)

`HeroSpotlight.tsx` is the hero. **With an offer (usually one):** the poster is the stage and stays put (several offers rotate, 10 s each, with dots); the big gold figure is the offer's own value (20%, 1+1, a price, from its data only; nothing if it has none); a "Featured" strip of product links sits under the stage. **Without an offer:** a show of products (categories fill in when fewer than five), a big `01 / 08` index, name and price (struck base price when discounted), thumbnails to jump, 6.5 s per slide. Swipe, arrow keys, and dots/thumbs work in both; reduced motion stops autoplay. Phone order: slogan, stage, details. The `?hero=` switcher and the other directions (cinema, columns, magazine, leather) still exist temporarily and should be deleted once the owner confirms.

## FINAL home design: "bento" (supersedes every hero and structure section above)

The owner chose the AntDesk-style bento design. Colours stay Flora's own (brown `#6b4423`, ivory `#faf9f6`, gold); only shapes and type change, scoped by `data-home="bento"` in `bento.css` (pill buttons, light display type). The page (`app/[lang]/page.tsx`) is: `BentoHero` (big rounded photo card with the slogan and a glass product card with arrows; a side card with the offer poster, or a category photo when there is no offer; a card of collection chips; the four promises), `HomeProducts` ("Our most loved", a rounded card with a sliding row of products), `AboutSection` (story, then the stats arc) and the reels (only when there are any). The categories arches component still exists but is not on the page (the chips replace it). Removed: the stitched-leather, cinema, columns, spotlight, magazine and the cover/editorial/collage looks, and their styles and the Italiana font.

## Home hero now: campaign banner (supersedes the "bento" hero; `?hero=bento` still shows the old one for comparison)

`Offers/CampaignHero.tsx`: a rounded brown banner that changes by itself (10 s for an offer, about 6 s otherwise), by swipe, by dots, with pause on hover. Slides, in order: each active **offer** (its own title, details, end date and the poster as a large card), two **featured products**, three **categories**. Product and category slides use the headline pattern from the reference: the product's picture sits INSIDE the headline between two words ("Shop [picture] Ballerinas", "Featured [picture] pieces"), popping in with a small turn. Under the banner a **promises ticker** moves continuously (WhatsApp, cash on delivery, delivery to all governorates, exchange or return). Below: "Everything in one place", a plain product grid with a small arrow button (no stock or sales figures). The slogan is the page's h1, centred above the banner.


## Home hero (current): cocoa gradient with a draggable curved row

- Ground: `--primary` fading to `#3a2211`, with a soft gold radial glow behind the slogan (`.fl-hero` in home.css). Bottom corners rounded 2.5rem; the rest of the page stays ivory.
- Slogan in the Arabic display face (Amiri) / Marcellus; its last word ("فلورا" / "Flora") is gold with a line drawn under it. Words rise out of a blur one by one (`fl-blurrise`); reduced motion shows everything at once.
- Buttons (scoped to `.fl-hero`): gold gradient pill `#ecd08a → #c9a24a → #ab8530`, text `#2a1608` (about 8:1), soft gold glow; the second button is a glass pill (cream at 8%, 1px cream border).
- The row of product pictures bends like the inside of a cylinder (wider and taller towards the edges, edge cards turned 16° towards the centre). It drifts, can be dragged, coasts, and pauses on hover or keyboard focus. Frame scale: phones 640 units, tablets 1000, laptops and up = real width.
- Text face for the interface: Readex Pro (Arabic and Latin), Jost for Latin.
- Under the hero: offers (only when active ones exist), then the product grid, the story, and the figures strip (a sentence + three numbers with thin dividers).
