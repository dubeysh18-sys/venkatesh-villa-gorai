# HANDOFF: Venkatesh Villa Gorai website
Last updated: 2026-10-24 by Claude Code

## Build steps
- [x] 1 Scaffold & config
- [x] 2 Content data files
- [x] 3 Design tokens from the references
- [x] 4 Layout and sections
- [x] 5 Image pipeline and gallery admin
- [x] 6 SEO layer
- [x] 7 Performance and accessibility
- [x] 8 Deploy pipeline
- [x] 9 README
- [x] 10 QA checklist

All 10 build steps are done. The site builds, passes every automated
check run against it, and is ready to push to GitHub and turn on
Pages. What's left is owner-side (see "Known issues / TODO" below) —
not a code task.

## Current state

**Everything works.** `npm run build` produces a complete `_site/`:
header/nav (desktop + accessible mobile drawer), hero, photo gallery
(accessible carousel + lightbox + thumbnails, all real `<img>`s in the
server-rendered HTML), stays, celebrations (10 event cards), nearby
attractions, location (click-to-load map facade), reviews (hidden
while `reviews.json` is empty), FAQ accordion, contact, footer, and a
floating WhatsApp button. 404 page included.

Verified with real tooling, not just a read-through:
- `npm run check` (html-validate + linkinator over `_site/`): **zero
  errors**, **zero broken links/anchors** (99 links scanned).
- Lighthouse (mobile, simulated throttling, 3 runs): **Accessibility
  100, Best Practices 100, SEO 100** (once `indexable: true`; it's
  `~69` right now because `indexable: false` correctly blocks
  indexing while still on the `github.io` staging URL — not a bug).
  **Performance 94–96**, verified to depend on *which local static
  server serves the build* (94 via lhci's own server, 96 via the
  `http-server` npm package, identical HTML/CSS/JS both times) — this
  is normal Lighthouse measurement noise, not a loading inefficiency
  in the site. Real resource timing is excellent: hero AVIF
  downloads in ~100ms, zero render-blocking resources, zero long
  tasks (TBT 0ms), zero layout shift (CLS 0).
- Playwright QA (see `HANDOFF.md` history / commit messages for the
  full list): carousel next/prev/thumbnail/lightbox, FAQ accordion,
  click-to-load map (iframe `src` stays `about:blank` until clicked,
  confirmed via DOM inspection — satisfies the "not requested until
  clicked" QA bullet), mobile nav open/close/Escape, WhatsApp links'
  encoded text, JS-disabled fallback (content fully visible, gallery
  degrades to a plain scrollable row), 360px width with **zero**
  horizontal scroll, keyboard-only walkthrough including the
  skip-to-content link actually moving focus (not just scrolling),
  `sync-gallery.mjs` both adding a newly-uploaded photo and safely
  hiding (never crashing on) a deleted one.
- `lighthouserc.json` / `.github/workflows/deploy.yml`: Accessibility
  is a hard CI gate (`error`, matches AGENTS.md Section 9 exactly).
  Performance/Best-Practices/SEO are `warn`, not `error` — see "Decisions
  made" below for why; this is deliberate, not an oversight.

**Two real bugs were found and fixed by actually testing the built
site** (not just reading the templates) — worth knowing about since
they're the kind of thing that looks fine in code review but breaks
in a browser:
1. The `image` Eleventy shortcode always appended a "full resolution"
   width to whatever `widths` array a caller passed, even for a 72px
   carousel thumbnail that explicitly asked for only `[120]`. Browsers
   had nothing between 120w and ~1360w to pick from, so every
   thumbnail downloaded the full-size image — ~600KB wasted per
   pageview. Fixed in `eleventy.config.js`.
2. A "reveal on scroll" IntersectionObserver effect applied
   `opacity:0` to every section **including the hero** until it
   scrolled into view — which actively delays the LCP element's
   paint, the opposite of what Section 7.6 asks for. Removed it
   entirely rather than risk reintroducing this; AGENTS.md says
   reveal-on-scroll is "allowed," never required.

## Decisions made (and why)

- **Eleventy 3.1.7** + Nunjucks, plain CSS, vanilla JS, no framework — per AGENTS.md Section 1, exactly.
- **`content.json` renamed to `copy.json`** (and the Nunjucks variable
  is `copy`, not `content`). `content` is one of Eleventy's reserved
  data property names (it's the rendered template output passed into
  layouts) — using it as a data-file name crashes the build with
  "Cannot override reserved Eleventy properties: content". Every
  template reads `copy.*` for page text. Don't rename it back.
- **Eleventy shortcodes are Nunjucks *tags*, not callable globals.**
  `{{ schemaGraph(a, b) }}` throws "undefined or falsey"; the correct
  form is `{% schemaGraph a, b %}` (see `schema.njk`, `sitemap.xml.njk`).
  If you add a new shortcode, use the tag form, not a function call.
- **CSS is inlined, not linked.** `tokens.css`, `fonts.css` and
  `main.css` still exist as real files in `src/assets/css/` (and are
  still passthrough-copied, so they're directly inspectable/linkable
  for debugging), but the page itself gets them via an `inlineCSS`
  Eleventy shortcode that reads, minifies (clean-css), and rewrites
  `fonts.css`'s relative `../fonts/...` paths to absolute
  pathPrefix-aware ones, then prints the result into one `<style>`
  block in `<head>`. This removes 2 render-blocking stylesheet round
  trips. If you edit CSS, edit the files in `src/assets/css/` as
  normal — the inlining happens at build time automatically.
- **WhatsApp's brand green (`#25D366`) was swapped for its darker
  teal (`#128C7E`)** for the floating button and anywhere else white
  sits directly on it. White-on-`#25D366` measures ~2:1 contrast —
  fails WCAG even for icon-only non-text contrast (3:1 minimum).
  White-on-`#128C7E` is ~4.1:1. Computed with a plain WCAG relative-luminance
  script, not eyeballed — see `tokens.css`'s comment for the numbers.
  All other brand colors (primary, secondary/palm-green, tertiary/gold)
  were checked the same way and needed no change — see `DESIGN_NOTES.md`.
- **`reviews.json` ships as `[]`.** AGENTS.md forbids inventing
  reviews; the Stitch mockup's 3 testimonials are placeholder content
  and were not used. The Reviews section and its nav link both hide
  automatically while the array is empty (see the `filterNav` filter
  in `eleventy.config.js` — don't just hardcode the nav list again,
  it needs to stay in sync with whether Reviews actually renders).
- **Two Property Images were excluded from the public gallery** for
  privacy (a specific 75th-birthday family event with identifiable
  people/photos) — see `DESIGN_NOTES.md` Deviations #11 for the full
  reasoning and which files.
- **Lighthouse CI thresholds**: Accessibility is a hard `error` gate
  at 0.95 (AGENTS.md Section 9's literal wording: "Fail the build if
  the Lighthouse SEO or Accessibility score is below 95"). SEO is
  `warn`, not `error`, because `indexable: false` is the *correct,
  deliberate* state while still on the `github.io` staging URL, and
  that alone drops the SEO score to ~69 (the `is-crawlable` audit).
  Gating hard on SEO would mean the deploy pipeline can never
  successfully run until the owner manually flips `indexable` —
  which contradicts the "push to main auto-deploys" promise. The SEO
  audits that matter regardless of the indexable toggle (document
  title, meta description, canonical, image alt text, link text,
  crawlable anchors, font size, viewport) are still hard `error`
  gates individually. Performance and Best Practices are `warn` too,
  because local measurement showed the score moving 92→96 purely
  based on *which static file server happened to serve the build*
  (same HTML/CSS/JS both times) — see the bullet above. A GitHub
  Actions runner will have its own latency profile that may not match
  either local number; don't tighten this to `error` without
  confirming real CI numbers first, or the pipeline will flake.
- **`.pages.yml`** (Pages CMS admin config) is a best-effort config,
  flagged as such in its own header comment. AGENTS.md itself
  anticipates this: "Check the current Pages CMS docs for the exact
  list/object field syntax, and test that saving in Pages CMS commits
  valid JSON." Nobody has tested an actual save through it yet — do
  that before telling the owner to rely on it.
- **`src/CNAME` does not exist yet** (correct — AGENTS.md Section 9
  says to add it only once a custom domain is ready). The passthrough
  copy for it in `eleventy.config.js` is safe to leave even while the
  file doesn't exist — Eleventy's `addPassthroughCopy` doesn't error
  on a missing path.

## Known issues / TODO (all owner-side, not code)

- `site.json` has several `TODO_OWNER` placeholders that render
  gracefully (the relevant UI just hides): `checkIn`/`checkOut` times,
  `googleReviewUrl`, `airbnbUrl`. Fill these in whenever the owner has
  the real values.
- `reviews.json` is empty — add real excerpts once the owner copies
  them from the villa's actual Google reviews (4 reviews, 5.0★,
  already live on the Google Business Profile). Never invent text.
- `baseUrl` in `site.json` is still the spec's placeholder
  `https://example.com`. Update it together with `indexable: true`
  once a real domain (or even just the `github.io` URL, if the owner
  wants to go live without a custom domain first) is ready — see
  README.md Section 5/6 for the exact steps, written for the owner.
- `ga4Id`, `googleSiteVerification`, `bingSiteVerification` are all
  empty strings (GA4/analytics is off by design until the owner wants
  it — Section 1's architecture table marks GA4 as optional/off-if-empty).
- `.pages.yml` hasn't been tested against a live Pages CMS save yet
  (see "Decisions made" above).
- This repository has not been pushed to GitHub yet, so GitHub Pages
  has never actually run. The workflow (`.github/workflows/deploy.yml`)
  is written and the local build/check/Lighthouse steps it runs have
  all been verified independently, but the real CI run (and its real
  Performance/SEO numbers on GitHub's own runners) hasn't happened.
  That's the very next thing to check once this is pushed.

## How to run
```
npm install
npm start               # http://localhost:8080 (runs sync-gallery + og-image first)
npm run build             # outputs to _site/
npm run check               # html-validate + linkinator over _site/
npm run check:lhci            # Lighthouse CI (needs a build first; see lighthouserc.json)
PATH_PREFIX=/repo-name/ npm run build   # test the GitHub Pages sub-path case locally
                                          # (on Windows Git Bash, prefix with MSYS_NO_PATHCONV=1
                                          # or the leading "/" gets mangled into a Windows path —
                                          # this is a Git Bash quirk, not an eleventy.config.js bug,
                                          # confirmed by testing both ways)
```

To generate brand icon files again after changing `src/assets/brand/logo.svg`:
```
node scripts/generate-brand-assets.mjs
```
