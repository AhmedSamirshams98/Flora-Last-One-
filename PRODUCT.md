# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Egyptian women shopping for shoes and bags. Mobile-first; Arabic (RTL) is the default language (`defaultLang = "ar"`), English (LTR) is secondary. Admins (ADMIN / SUPERADMIN roles) manage the catalog, offers, orders, categories, marquee text and reels from a dashboard.

## Product Purpose

Flora Egypt (floraegypt.com) is a bilingual online store for luxurious women's leather shoes and bags. Customers browse by category, keep a wishlist and cart, and place orders; admins run the whole catalog without a developer. Founded 2024 (per the About copy). The site is deployed but not yet announced to customers.

## Operating Context

Self-hosted on a VPS (`/var/www/flora`), Next.js + PostgreSQL. Home content is admin-driven: offers slider (images + dates), home category tiles, a marquee announcement bar, Facebook reels. Product images are admin-uploaded product photography.

## Capabilities and Constraints

- Catalog is limited to two product types, SHOE and BAG, with fixed subtypes (heels/pumps, ballerinas, loafers, sandals, sneakers, winter boots, slippers; hand, shoulder, crossbody, clutch, backpacks, wallets).
- Products have colour variants with sizes, stock and per-variant images; pricing types: single, sale, with-offer.
- Google sign-in only. No online payment is implemented.
- This redesign is visual only: data model, API shapes and store contracts must not change.
- Must work in both RTL and LTR.

## Brand Commitments

- Name: Flora / فلورا. The gold engraved wordmark with leaf-in-the-O (`public/images/logo.png`, transparent PNG) stays; its colours are binding.
- Fonts already shipped: Gess (Arabic, three weights, `public/fonts`). Direction pinned by the owner: luxurious and calm.
- The home "About" stat counters (+1000 customers, +50 brands, 100% satisfaction) are kept by the owner; the owner wants a better presentation and will bring Dribbble references.

## Evidence on Hand

Product photography only (admin-uploaded). No campaign, lifestyle or model photography exists. No testimonials or press. Stats above are the owner's own figures, unverified here.

## Product Principles

1. The product photograph is the hero; the interface stays out of its way.
2. Arabic first: every layout is designed in RTL and then mirrored, never the reverse.
3. Content stays admin-driven; design must hold up with 1 offer or 10, with and without images.
4. Never invent commercial claims; use only what the owner confirmed.
