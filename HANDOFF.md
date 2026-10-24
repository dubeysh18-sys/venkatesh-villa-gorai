# HANDOFF: Venkatesh Villa Gorai website
Last updated: 2026-10-24 by Claude Code

## Build steps
- [x] 1 Scaffold & config
- [x] 2 Content data files
- [ ] 3 Design tokens from the references   ← NEXT
- [ ] 4 Layout and sections
- [ ] 5 Image pipeline and gallery admin
- [ ] 6 SEO layer
- [ ] 7 Performance and accessibility
- [ ] 8 Deploy pipeline
- [ ] 9 README
- [ ] 10 QA checklist

## Current state

**Step 1 (scaffold) done:**
- `git init` done, `npm install` done (Eleventy 3.1.7, @11ty/eleventy-img 7.1.1, html-validate 11.17.0, linkinator 8.1.0, @lhci/cli 0.15.1 — exact versions pinned in `package.json`).
- `eleventy.config.js`: input `src/`, output `_site/`, `pathPrefix` driven by `PATH_PREFIX` env var (defaults to `/`). Adds an `image` async shortcode (AVIF+WebP+JPEG, 5 widths, via `@11ty/eleventy-img`), an `imageMeta` shortcode (raw metadata, for the hero `<picture>` + OG image later), `whatsappUrl`, `url`, `year`, `isoDate`, `jsonify` filters. Passthrough copies for `assets/css`, `assets/js`, `assets/fonts`, `assets/brand`, `images/site`, and `CNAME`.
- Folder layout created per AGENTS.md Section 10.
- `scripts/sync-gallery.mjs` written and tested (`node scripts/sync-gallery.mjs` → "0 added, 0 missing, 6 total slides"). Wired as `presite` npm script, runs before both `start` and `build`.
- `.gitignore` excludes `node_modules/`, `_site/`, caches.
- `CLAUDE.md` created (`@AGENTS.md`, one line, per instructions).

**Step 2 (content data files) done:**
- `src/_data/site.json` — NAP, phone (call vs WhatsApp split), Google Maps/Directions URLs, geo coords, `indexable: false` (still on github.io / local), `showPrices: false`. Several fields intentionally left as `TODO_OWNER: ...` placeholders exactly as specified (check-in/out time, Google review link, Airbnb URL, GA4 ID, site verification tokens) — templates must hide any UI tied to a field that is empty or starts with `TODO`.
- `src/_data/content.json` — all page copy: hero, stays, celebrations (10 event cards with icon keys + WhatsApp labels), nearby/location/reviews/FAQ section headers, WhatsApp message templates (exact text from AGENTS.md Section 3), footer tagline.
- `src/_data/gallery.json` — 6 real property photos (see "Photos used" below), `autoplay: false`.
- `src/_data/attractions.json` — 7 nearby places with Google Maps directions `destination` text.
- `src/_data/faq.json` — the 6 owner-approved Q&As from AGENTS.md Section 4, verbatim.
- `src/_data/reviews.json` — **empty array `[]`**. AGENTS.md forbids inventing reviews; the Stitch mockup's 3 testimonials are placeholder content. Reviews section must hide when this is empty. Real excerpts need to come from the owner (from the villa's 4 genuine Google reviews) — flagged as a TODO for the owner in the README.

**Design references read (for step 3, already captured in `DESIGN_NOTES.md`):**
- `design-references/stitch/DESIGN.md` — full design-token spec (colors, type scale, spacing, radius, shadow character, component notes).
- `design-references/stitch/code.html` — full one-page Tailwind mockup (used as primary layout reference).
- `design-references/stitch/screen.png` — rendered screenshot, confirms the mockup renders as expected (warm terracotta/cream villa site, Playfair Display headlines, pill buttons, photo-led cards).
- Section map, extracted tokens and all deviations from the mockup are written up in `DESIGN_NOTES.md` — read that file before building the sections (step 4), since it also explains *why* each removed/invented element was changed.

**Photos used (from `Property Images/`, originals untouched there, copied+renamed into `src/images/gallery/`):**
1. `venkatesh-villa-gorai-front-dusk.png` ← `image copy.png` — sunset facade, used as the **hero** image.
2. `venkatesh-villa-gorai-front-daytime.png` ← `image.png` — daylight facade.
3. `venkatesh-villa-gorai-grounds-aerial.webp` ← `unnamed (4).webp` — drone/aerial shot of gate, courtyard, lawn, parking, Mumbai skyline.
4. `venkatesh-villa-gorai-kashi-kutir-gazebo.webp` ← `unnamed (5).webp` — the "Kashi Kutir" wooden gazebo at night, matches the named-spot table in AGENTS.md Section 4.
5. `venkatesh-villa-gorai-living-entrance.webp` ← `unnamed (3).webp` — lit entrance hall, staircase, kitchenette at night.
6. `venkatesh-villa-gorai-staircase-bedroom.webp` ← `unnamed.webp` — interior staircase past a bedroom, daytime.

**Not used** (stay in `Property Images/` only, not copied into `src/`): `unnamed (1).webp` and `unnamed (2).webp` — both show a specific private family event (a 75th-birthday celebration) with identifiable people in frame or printed on a banner. Excluded for guest/family privacy; see `DESIGN_NOTES.md` → Deviations #11. If the owner wants an "event in action" gallery photo later, ask for one without recognizable faces.

## Decisions made (and why)

- **Eleventy 3.1.7** (current v3.x stable at build time, per AGENTS.md Section 1) with **Nunjucks**, plain CSS, vanilla JS — no framework, matching the architecture table exactly.
- `eleventy.config.js` uses `type: "module"` / ESM import syntax (package.json has `"type": "module"`).
- Image shortcode processes images straight from `src/images/gallery/<file>` (not a `njk`-relative path), keeping `gallery.json`'s `file` field as the single filename the owner edits.
- `reviews.json` ships empty rather than with placeholder reviews — see above. This is a deliberate deviation from "fill every data file with starting content" because AGENTS.md explicitly forbids invented review text; it's called out here so the next agent doesn't accidentally add the Stitch mockup's fake reviews back in.
- Two Property Images excluded from the gallery for privacy (identifiable people) rather than cropped/blurred — cropping/face-blurring was judged out of scope for this pass; easiest safe default was to leave them out and ask the owner for replacements.

## Known issues / TODO
- `site.json` has several `TODO_OWNER` placeholders (check-in/out times, Google review link, Airbnb URL, GA4 ID, Search Console/Bing verification). None of these should ever print literally on the page — must re-verify this once templates exist (step 4/12 QA).
- `reviews.json` is empty — ask the owner for real Google review excerpts once available.
- `baseUrl` in `site.json` is still the spec's placeholder `https://example.com` — must be updated once a GitHub Pages / custom domain URL exists (Section 7.5/9).
- No `src/index.njk` or any section partials exist yet — that's step 4, the biggest remaining step. Build `src/_includes/layouts/base.njk` + `src/_includes/sections/*.njk` + `src/index.njk` next, following the section order and copy already sitting in `content.json`/`gallery.json`/etc.
- Brand assets (`src/assets/brand/logo.svg` etc.) not created yet — no logo file was supplied by the owner. Will need a simple text/wordmark SVG logo built from the brand palette, or ask the owner for a real logo file.
- Fonts (Playfair Display, Inter) need to be downloaded and self-hosted as subset WOFF2 under `src/assets/fonts/` — not done yet.

## How to run
```
npm install
npm start            # http://localhost:8080 (runs sync-gallery first)
npm run build         # outputs to _site/ (runs sync-gallery first)
npm run check          # html-validate + linkinator over _site/
npm run check:lhci     # Lighthouse CI (needs a build first)
```
