# HANDOFF: Venkatesh Villa Gorai website
Last updated: 2026-10-24 by Claude Code (Round 2 owner review applied)

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
server-rendered HTML), 8 celebrations cards (4x2 on desktop), a
compact icon-tile Stays section (with a "Book on Airbnb" button), 6
nearby-attraction cards (3x2 on desktop), location (a connected "how
to reach" journey stepper + a directly-embedded lazy-loaded map),
reviews (hidden while `reviews.json` is empty), an exclusive-open FAQ
accordion ("FAQs", first question open by default), contact, footer
(NAP + Instagram/Maps/Airbnb), and a floating WhatsApp button. Page
order: Hero → Gallery → Celebrations → Stays → Nearby → Location →
Reviews → FAQ → Contact. 404 page included. See "Change rounds" below
for everything changed in owner review rounds 1 and 2
since the initial build.

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
  the map iframe (`loading="lazy"`, confirmed it isn't eagerly
  fetched), mobile nav open/close/Escape, WhatsApp links' encoded
  text, JS-disabled fallback (content fully visible, gallery degrades
  to a plain scrollable row), 360px width with **zero** horizontal
  scroll, keyboard-only walkthrough including the skip-to-content
  link actually moving focus (not just scrolling), `sync-gallery.mjs`
  both adding a newly-uploaded photo and safely hiding (never
  crashing on) a deleted one, and (Round 1) real pixel-sampled
  contrast behind the hero H1/subline on both viewports.
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

## Change rounds

### Round 1 (2026-10-24): owner review of the local build

The owner reviewed the initial build and sent 7 numbered change
requests plus a general redundancy audit. All applied; `AGENTS.md`
was updated in the same pass (and, since it had never actually been
written to disk despite being the spec this whole project follows,
created for the first time from the original prompt text — see commit
`round1: 3 ...`) so these aren't spec deviations any more, they're
just what the spec says now. Commits, in order:

1. **Nearby attractions**: added Keshav Srushti (Uttan, Bhayandar
   West; drive time estimated from the villa's coords since no exact
   source was given — labelled "approx." as the pattern already does
   for every other estimated time), removed the Gorai–Borivali ferry
   jetty card (duplicated the new "how to reach" stepper). 7 cards; a
   CSS rule centres a lone last-row card in the 3-column desktop grid
   (`.nearby__grid > :last-child:nth-child(3n + 1)`) rather than
   leaving it stranded on the left.
2. **Celebrations**: merged Haldi/Mehendi/Sangeet into one card (its
   WhatsApp message is literally "haldi / mehendi / sangeet" substituted
   into the existing `{event}` template — verified the decoded URL
   matches the owner's exact requested wording). 8 cards, 4×2 grid on
   desktop (≥1024px), 2 columns below that (was 1 column on mobile,
   2 from 640px — owner asked for 2 columns on mobile too).
3. **Location**: removed the "Open in Google Maps" button (kept
   "Get directions" as the one primary action) and the click-to-load
   map facade — the embed iframe now loads directly with
   `loading="lazy"` at a fixed height (280px mobile / 360px desktop,
   no layout shift). Removed the section's 4th repetition of "Gorai
   Beach is a 5-minute drive" (already said in the intro, the Gorai
   Beach nearby card, and FAQ #3). CSP needed no change — `frame-src
   https://www.google.com` already covered the iframe.
4. **How to reach**: replaced the three disconnected boxes with one
   `<ol>` journey (Borivali Station → Gorai Jetty → Gorai side →
   Venkatesh Villa) where each `<li>` is `[connector, node]` in DOM
   order — that's what lets the *same* markup read correctly as a
   horizontal stepper (`flex-row`, desktop) or a vertical timeline
   (`flex-column`, mobile) with no JS and no duplicated markup. A
   separate "Coming by car?" card below it holds the Get directions
   button. Added a `train` icon.
5. **FAQ**: added "Can we bring our own decorator or caterer?", moved
   the catering-on-request sentence out of the food answer into it,
   shortened the Borivali-station answer and linked its "How to
   reach" phrase to `#location` — but only in the *visible* HTML
   (`faq.njk` escapes the answer text then replaces that one phrase
   with a real `<a>`); `schema.njk`'s FAQPage still mirrors the
   original plain-text answer, confirmed by reading the built
   JSON-LD directly rather than assuming the filter chain worked.
6. **Airbnb**: added as a secondary, stays-only channel —
   `site.json.airbnbUrl` is now the real clean listing URL (was
   `TODO_OWNER: optional`). Stays section gained its own WhatsApp +
   Call buttons (it had neither before this round) with the Airbnb
   link below a divider in a deliberately weaker outline/text style.
   No Airbnb embed script anywhere (checked the built HTML for
   `airbnb_jssdk`). Footer gained an Instagram/Google Maps/Airbnb
   link row. `schemaGraph`'s `sameAs` picked up the URL automatically
   (it already read `site.airbnbUrl`, it just needed a real value).
   GA4 clicks on any Airbnb link fire `airbnb_click`, not
   `generate_lead`.
7. **Redundancy fixes found in review, plus a few more found during
   the general audit**:
   - Removed the full address from the Contact card (footer is now
     the one crawlable NAP block; Contact keeps only action links).
   - Stays' two "Ask us" check-in/check-out boxes replaced with one
     "timings are flexible" line while both are unset; the two boxes
     come back automatically once `site.json`'s `checkIn`/`checkOut`
     are both filled in (`{% if site.checkIn | isSet and
     site.checkOut | isSet %}`).
   - Contact card: WhatsApp is now the filled primary button, Call
     the outline secondary (was backwards). **Found a real contrast
     bug while fixing this**: the existing `--color-whatsapp`
     (`#128C7E`) only measures ~4.1:1 against white — fine for the
     *icon-only* floating button (needs 3:1) but not enough for a
     button carrying visible text (needs 4.5:1). Added a separate,
     darker `.btn--whatsapp` (`#075E54`, WhatsApp's own darkest brand
     teal, ~7.7:1) for text buttons instead of reusing the icon-only
     color. Scoped to the Contact card only, not applied everywhere
     WhatsApp buttons already existed (hero/header/stays all already
     passed contrast with their existing primary/secondary colors —
     changing them wasn't asked for and would be a drive-by redesign).
   - Hero contrast: didn't just eyeball it — wrote a Playwright
     script that samples actual pixel colors behind the H1/subline on
     a real hero photo at both viewports and computes WCAG contrast.
     One desktop sample came back ~4.07:1 (passes H1's large-text 3:1
     requirement, but with less margin than wanted). Strengthened the
     scrim gradient (0.85/0.45/0.2 → 0.88/0.55/0.32 opacity stops);
     re-measured, every sample is now ≥4.5:1 on both viewports.
   - Added `@media print` styles: forces background-color printing
     (`print-color-adjust: exact`) and a near-opaque scrim specifically
     for print, since browsers drop background colors by default when
     printing/exporting to PDF — this, not a real rendering bug, is
     almost certainly why the owner saw a "faded" hero and a "grey"
     WhatsApp button in their PDF export. Also hides the floating
     button, nav toggle, mobile nav and carousel controls in print.
   - **Audited but intentionally left alone, flagged here instead**:
     the Contact card and the footer now both show an Instagram +
     Google Maps link, sitting in two adjacent sections. This wasn't
     redundant before Round 1 (only the footer had them); it became a
     mild duplication once change 6 added the same two links to the
     footer per the owner's literal instruction ("next to Instagram
     and Google Maps"). Left both in place since removing either
     wasn't asked for — worth a decision from the owner if it reads
     as repetitive once they see it live.

Screenshots of Celebrations/Stays/Location/FAQ/Contact at 390px and
1440px are in `design-references/review-round1/`.

Verified after Round 1: `npm run check` (html-validate + linkinator)
still zero errors/zero broken links; Lighthouse mobile unchanged at
Accessibility 100 / Best Practices 100 / SEO 100 (indexable:true) /
Performance 94 — no regression from the new CSS (stepper, Airbnb
card, print block).

### Round 2 (2026-10-24): owner review of Round 1's build

Note: the owner's instructions referenced reading a `CHANGES_ROUND_1.md`
file first. That file doesn't exist — Round 1 was logged directly in
this file (the section above) instead, so that's what was actually
read. Worth flagging in case the owner expected a separate file; easy
to split out later if wanted, nothing was lost either way.

5 numbered changes, each committed separately:

1. **Section order**: moved Stays to after Celebrations. New order:
   Hero → Gallery → Celebrations → Stays → Nearby → Location →
   Reviews → FAQ → Contact. Both the header nav and footer links read
   from the same `copy.json` `nav` array, so reordering it once fixed
   both automatically — no separate footer edit needed. While
   verifying every anchor still scrolled correctly, found a
   **pre-existing gap, not something this reorder caused**: there was
   no `scroll-padding-top` anywhere, so every `#anchor` jump (nav
   links, the FAQ's "How to reach" link from Round 1) had always been
   landing with the target section's heading partly hidden under the
   72px sticky header. Added `scroll-padding-top: 88px` to `html`;
   re-tested all 7 nav links, all land with the section's top at or
   below the header's bottom edge now.
2. **Nearby attractions**: removed "Gorai mangroves & village lanes".
   6 cards now fit the existing 3-column desktop grid exactly (3+3,
   no orphan), so no CSS change was needed there — the round1
   last-child-centering rule simply doesn't match at this count and
   was left in place as a harmless safety net for if the list grows
   again later.
3. **Stays redesign** (the big one): replaced the paragraph + bullet
   list + price note + check-in box + overlapping "Exclusive booking"
   card with an intro line, an 8-tile icon grid (4x2 desktop / 2-col
   mobile, `<ul>` with `aria-hidden` icons), 2 "good to know" chips,
   and 3 buttons (WhatsApp filled, Call outline, new **Book on
   Airbnb** outline button replacing Round 1's separate Airbnb
   link/card). Photo/content layout uses CSS `order` so one markup
   structure naturally gives photo-on-top on mobile and
   content-left/photo-right on desktop, with the photo stretching to
   match the content column's height (grid `align-items:stretch`,
   capped at `max-height:520px`). Added a `"stays": true` flag to
   `gallery.json` (new `staysSlide` filter) so the section's photo is
   an explicit choice, not an implicit "whichever slide happens to be
   last" convention. Added 5 new icons (lock, users, racket, utensils,
   car) to `icons.njk`. Measured result: section height dropped to
   626px at 1440px (target was "roughly one screen, ~800px") and is
   visibly much shorter on mobile. No `amenityFeature` schema change
   needed — every amenity word from the old bullet list is still
   literally present in a tile label or sub-label, just reformatted.
4. **FAQ heading**: removed the "Got questions?" eyebrow, H2 now
   reads "FAQs". Nav/footer label was already changed to "FAQs" in
   change 1 (same array).
5. **FAQ exclusive accordion**: `name="faq"` on every `<details>` —
   tested this is enough **on its own, with JavaScript fully
   disabled**, to get native exclusive-open behavior in this
   Chromium build (confirmed: click a second question, the first
   closes, zero script ran). The JS in `main.js` is purely the
   documented fallback (closes other open items on `toggle`) plus the
   "don't leave the opened question hidden under the sticky header"
   scroll correction, which native HTML has no way to do on its own.
   First question defaults open via a Nunjucks `{% if loop.first %}`
   check, not a separate data flag.

Also updated `AGENTS.md`: Section 3's page-structure list reordered
and the Stays entry fully rewritten to the new compact spec, the
Nearby attractions list and card-count math, the FAQ entry (heading
text, exclusivity requirement), Section 3a rewritten for the new
button-not-link Airbnb treatment, two stale example references
("Frequently asked questions" H2 example, "exactly 7 cards" checklist
line), and two new Definition-of-Done checklist items (FAQ
exclusivity, Stays compactness).

Screenshots of Celebrations/Stays/Nearby/FAQs at 390px and 1440px are
in `design-references/review-round2/`.

Verified after Round 2: `npm run check` still zero errors/zero broken
links (99 links). Lighthouse mobile (indexable:true): **Performance
96, Accessibility 100, Best Practices 100, SEO 100** — all four
categories clear the >=95 bar the Round 2 brief asked for explicitly
(Round 1's brief only required it informally; this time it's a named
"Done when" checkbox, and it's met).

## Known issues / TODO (all owner-side, not code)

- `site.json` has two remaining `TODO_OWNER` placeholders that render
  gracefully (the relevant UI just hides): `checkIn`/`checkOut` times
  (Stays shows one "timings are flexible" line instead of two empty
  boxes until both are set) and `googleReviewUrl`. `airbnbUrl` was
  filled in during Round 1.
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
