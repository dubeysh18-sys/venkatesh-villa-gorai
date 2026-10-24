# Build Prompt: Venkatesh Villa Gorai: one-page, SEO-first website

> **How to use this file (owner):**
> 1. Create the project folder and open it in VS Code.
> 2. Save this file in the project root as **`AGENTS.md`** (Codex reads it automatically).
> 3. Create a second file **`CLAUDE.md`** containing just one line: `@AGENTS.md`. Claude Code then reads the same instructions.
> 4. Put your Google Stitch screenshots in **`design-references/`** (see Section 0.2).
> 5. In Codex, type: *"Read AGENTS.md and start the build. Follow it exactly."*
> 6. If Codex runs out, open Claude Code in the same folder and type: *"Read AGENTS.md and HANDOFF.md, then continue from the next unchecked step."*

---

## 0. Your role and how to work

You are a senior front-end engineer **and** a local-SEO specialist for tourism, villa and event-venue businesses in Mumbai (Borivali–Gorai–Manori–Uttan belt). Build a production-ready, **single-page** website for **Venkatesh Villa Gorai**, a private 4BHK villa near Gorai Beach, Mumbai, rented for overnight stays and for day events.

The owner is **not technical**. That means:
- Make every decision yourself unless this prompt says to ask. Choose sensible defaults and list them in the README.
- Everything the owner may want to change (text, phone, photos, prices, FAQs) must live in **simple data files**, never hard-coded in HTML templates.
- Write a README in plain English, with step-by-step instructions and no jargon.
- Before you finish, run every check in **Section 12** and fix all failures.

Work in this order: (1) scaffold and config, (2) content data files, (3) design tokens from the references, (4) layout and sections, (5) image pipeline and gallery admin, (6) SEO layer, (7) performance and accessibility, (8) deploy pipeline, (9) README, (10) QA checklist.

---

## 0.1 Multi-agent handoff: mandatory, because two different AI tools will work on this

The build may start in **Codex** and continue in **Claude Code** when Codex usage runs out, possibly switching back and forth. The next agent has **no memory** of the previous one, so the repository itself must hold all context.

1. **Git from the first minute.** Run `git init` if needed. **Commit after every completed step** with a clear message, e.g. `step 4: gallery carousel + sync script`. Never leave large uncommitted work: an agent can be cut off at any moment.
2. **Maintain `HANDOFF.md` at the repo root.** Create it in step 1 and update it **before every commit**. Structure:
   ```md
   # HANDOFF: Venkatesh Villa Gorai website
   Last updated: <date/time> by <Codex | Claude Code>
   ## Build steps
   - [x] 1 Scaffold & config
   - [ ] 2 Content data files   ← NEXT
   ...(all 10 steps from Section 0)
   ## Current state
   What works, what is half-done (file + function names), and the exact next action.
   ## Decisions made (and why)
   Versions chosen, deviations from the design references, anything you assumed.
   ## Known issues / TODO
   ## How to run
   npm install · npm start · npm run build · npm run check
   ```
3. **On starting (or resuming) a session:** read `AGENTS.md`, then `HANDOFF.md`, then `git log --oneline -20`, then `DESIGN_NOTES.md`. Run `npm install && npm run build` to confirm the current state works **before** changing anything. Continue from the first unchecked step. Do not redo or restyle finished work unless it is broken or contradicts this file.
4. **Do not change the tech stack, folder layout or data-file formats** chosen by a previous agent, unless they violate this file. If you must, record why in `HANDOFF.md`.
5. **Keep tool-neutral.** Use only standard npm scripts and plain files, with no agent-specific config needed to build. Both agents must be able to run everything from the terminal.
6. Keep each step small enough to finish and commit within one session (about 30–60 minutes of agent work).

## 0.2 Design references (Google Stitch): replicate them

The owner has created screens in **Google Stitch** and placed them in **`design-references/`** (PNG/JPG screenshots; possibly also Stitch-exported HTML/CSS). **The final website must look like these designs.** Treat them as the visual source of truth.

**Before writing any UI code (build step 3):**
1. Open and study **every** file in `design-references/`. Work out which ones are mobile and which are desktop, and which section each shows. If Stitch HTML/CSS is present, use it as the primary source for exact colours, fonts, spacing and radii. Rewrite it into clean, semantic, accessible code; never paste Stitch output as-is.
2. Extract the **design tokens** into `src/assets/css/tokens.css`: colours, font families and weights, type scale, spacing scale, border radius, shadows, button styles, card styles, section backgrounds, icon style.
3. Write **`DESIGN_NOTES.md`**:
   - the map of each reference file to the page section it represents
   - the extracted tokens
   - the section order taken from the designs
   - a **Deviations** list (see the rules below)
4. Build each section to **match the reference as closely as possible**: layout, order, proportions, spacing, typography, colours, button shapes, card styles, icons, and the header/footer look. Mobile reference → mobile layout; desktop reference → desktop layout. If only one size exists, adapt it responsively in the same style.
5. After building each section, **compare against the reference** (run the site, take a screenshot with Playwright at 390px and 1440px, look at both side by side) and fix differences before committing.

**What the design does NOT override** (where they conflict, this file wins; record each case in DESIGN_NOTES.md → Deviations):
- **Content and facts:** use the real copy, data files and photos from this spec. Replace Stitch placeholder text, stock images, invented reviews, prices, ratings, amenities and any **swimming pool** with real content or remove them.
- **SEO structure** (Section 7): one H1, the heading hierarchy, server-rendered images, NAP text, schema.
- **Accessibility** (Section 7.7): if a design colour fails WCAG AA contrast, keep the hue but darken or lighten it just enough to pass.
- **Performance** (Section 7.6): self-host the fonts the design uses (no Google Fonts `<link>`), no heavy animation libraries, lazy-loaded map iframe.
- **Required sections or features missing from the designs** (e.g. floating WhatsApp button, FAQ, nearby attractions, location): design them **in the same visual language** as the references.
- **Extra sections shown in the designs but not in this spec:** keep them if they fit a one-page villa site and can be filled with real content. Otherwise leave them out and note why.
- **If `design-references/` is empty or missing:** stop and ask the owner to add the screenshots. Do not invent a design. Steps 1–2 and 5–6 can proceed meanwhile.

---

## 1. Architecture decision (already analysed: implement exactly this)

**No backend is needed.** Every customer action is a link (WhatsApp, phone, Instagram, Google Maps). There are no logins, payments or database. A static site is faster, free to host, more secure and better for SEO.

| Concern | Decision | Why |
|---|---|---|
| Framework | **Eleventy (11ty), current stable v3.x**, Nunjucks templates, plain CSS, vanilla JS (no jQuery, no React, no CSS framework) | Produces **pre-rendered static HTML**, so Google sees all text and images without running JS. Tiny output and excellent Core Web Vitals. |
| Images | **@11ty/eleventy-img** at build time: AVIF + WebP + JPEG fallback, multiple widths, `width`/`height` attributes always set | Fast LCP, no layout shift, responsive. |
| Admin (photo control) | **Folder-driven gallery + `gallery.json` manifest**, plus optional **Pages CMS** UI (see Section 6) | Owner can change carousel photos with no code, for ₹0. |
| Hosting (now) | **Local** (`npm start`), then **GitHub Pages via GitHub Actions** | Free. A custom domain can be added later. |
| Hosting (later) | Same GitHub Pages + custom domain (CNAME), HTTPS enforced | GitHub automatically redirects the `*.github.io` URL to the custom domain. |
| Enquiries | WhatsApp deep links (pre-filled messages) + `tel:` link. **No contact form.** | WhatsApp is how this audience books. A form would need a backend or third-party service. |
| Analytics | Google Analytics 4 (ID in config, off if empty) + Google Search Console meta verification (config) | Measure WhatsApp/Call clicks as conversions. |

Pin exact dependency versions in `package.json`. Node LTS. Scripts:
- `npm start`: local dev server with live reload
- `npm run build`: production build to `/_site`
- `npm run check`: runs HTML validation, link check and Lighthouse CI (Section 12)

The site must work under a **path prefix** while on `https://<user>.github.io/<repo>/` and at the root on a custom domain. Use Eleventy `pathPrefix` driven by config/env and the `url`/`htmlBaseUrl` filters. **Never** hard-code absolute paths.

---

## 2. Owner-editable configuration (create these files)

### `src/_data/site.json`: single source of truth (NAP must match Google Business Profile exactly)
```json
{
  "name": "Venkatesh Villa Gorai",
  "alternateNames": ["Venkatesh Villa", "Vyankatesh Villa Gorai", "व्यंकटेश व्हिला गोराई"],
  "tagline": "Private 4BHK villa near Gorai Beach for stays & celebrations",
  "baseUrl": "https://example.com",
  "indexable": false,
  "phoneE164": "+919821295016",
  "phoneDisplay": "+91 98212 95016",
  "whatsappNumber": "919769541897",
  "whatsappDisplay": "+91 97695 41897",
  "email": "",
  "instagram": "https://www.instagram.com/venkatesh_villa_/",
  "googleMapsUrl": "https://share.google/BOdsueWupvKAWBgaY",
  "googleDirectionsUrl": "https://www.google.com/maps/dir/?api=1&destination=19.23419,72.78656",
  "googleReviewUrl": "TODO_OWNER: from Google Business Profile → 'Ask for reviews' → copy link",
  "airbnbUrl": "TODO_OWNER: optional",
  "address": {
    "street": "Manori - Gorai Rd, Haud Pada, Culvem Village",
    "locality": "Gorai, Borivali West",
    "city": "Mumbai",
    "region": "Maharashtra",
    "postalCode": "400091",
    "country": "IN",
    "plusCode": "6QMP+MJ Gorai, Mumbai",
    "displayLine": "Manori - Gorai Rd, Haud Pada, Culvem Village, Gorai, Borivali West, Mumbai, Maharashtra 400091"
  },
  "geo": { "lat": 19.23419, "lng": 72.78656 },
  "checkIn": "TODO_OWNER e.g. 12:00",
  "checkOut": "TODO_OWNER e.g. 11:00",
  "maxOvernightGuests": 15,
  "maxEventGuests": "50+",
  "showPrices": false,
  "priceRange": "₹₹",
  "ga4Id": "",
  "googleSiteVerification": "",
  "bingSiteVerification": "",
  "foundingYear": ""
}
```
Location facts (verified from the villa's live Google Business Profile, Oct 2026):
- The Google listing is **"Venkatesh villa"** (वेंकटेश विला), category *Holiday home*, rated 5.0 (4 reviews), Plus Code **6QMP+MJ**. Coordinates decoded from the Plus Code: **19.23419, 72.78656** (the centre of a ~14 m cell). Use them for schema `geo`, the map embed and directions links.
- Every "Open in Google Maps" / "View on map" / address link uses `googleMapsUrl` (the owner's share link, which opens the villa's actual Google listing). Every "Get directions" button uses `googleDirectionsUrl`.
- **Two numbers:** `phoneE164` (+91 98212 95016) is the number on the Google listing, so use it for the visible "Call" button, the NAP text and schema `telephone`, to keep NAP consistent. `whatsappNumber` (+91 97695 41897) is used **only** for WhatsApp links. Show both in the contact section, clearly labelled "Call" and "WhatsApp". Owner: if you'd rather show one number everywhere, change it on the Google listing as well, so they always match.

Rules:
- Every TODO must render gracefully. If a value is empty or still starts with `TODO`, hide that UI element and leave that schema property out. **Never print "TODO" on the live page.**
- `indexable: false` outputs `<meta name="robots" content="noindex, nofollow">` and a disallow-all `robots.txt`. `indexable: true` outputs indexable tags, the sitemap and normal `robots.txt`. The owner flips this to `true` only when the final domain is live. The README must explain this clearly.
- `baseUrl` drives canonical, OG URLs, the sitemap and schema `@id`/`url`.

### `src/_data/content.json`: all page copy (see Section 4 for the starting copy)
### `src/_data/gallery.json`: carousel manifest (see Section 6)
### `src/_data/attractions.json`: nearby places
### `src/_data/faq.json`: questions and answers
### `src/_data/reviews.json`: **real** guest reviews only (empty array allowed; the section hides when empty)

---

## 3. Page structure (one page, anchor navigation)

Use semantic HTML5: `<header>`, `<nav>`, `<main>`, `<section id="...">` each with its own `<h2>`, `<footer>`. Exactly **one `<h1>`**. Set `lang="en-IN"`.

1. **Header (sticky, slim):** logo (SVG/PNG from `/src/assets/brand/`) + name, anchor nav (Gallery · Celebrations · Stays · Nearby · Location · Reviews · FAQs · Contact), and a primary button "WhatsApp us". On mobile, use a hamburger menu that is accessible (button with `aria-expanded`, focus trap, Esc closes). The sticky header's height must be compensated for on every in-page anchor jump (`scroll-padding-top` on `html`, or equivalent) so a section's heading never lands hidden underneath it.
2. **Hero (`#home`):** the full-bleed first gallery image (or `hero: true` image) is the **LCP element**. Use `fetchpriority="high"`, no lazy-loading, and preload the right size. Overlay:
   - **H1:** `Venkatesh Villa Gorai: Private 4BHK Villa near Gorai Beach, Mumbai`
   - Sub-line: `Weekend stays, birthdays, haldi & mehendi, anniversaries and team outings, with a lawn, rooftop gazebo and sunset views.`
   - Two CTAs: **"Check dates on WhatsApp"** (stay message) and **"Plan an event"** (event message).
   - Trust chips: `4 Bedrooms · 3 Bathrooms · Lawn · Rooftop Gazebo · Caretaker on-site`.
3. **Gallery carousel (`#gallery`):** admin-managed from `gallery.json` (Section 6). Accessible, swipeable, keyboard-operable, **no autoplay by default** (if autoplay is enabled in config: pause on hover/focus, include a visible Pause button, and respect `prefers-reduced-motion`). Show the caption under each slide. Add a thumbnail strip and a lightbox. **All slide `<img>` elements must be in the server-rendered HTML** (not injected by JS) with real `alt` text.
4. **Celebrations & events (`#celebrations`):** cards for Birthday parties · Anniversaries · Haldi, Mehendi & Sangeet (one merged card) · Engagement · Intimate weddings · Corporate team outings · Day picnic (one-day outing) · New Year's Eve. 8 cards total, 4 columns × 2 rows on desktop/laptop (≥1024px), 2 columns on tablet and mobile, equal card heights. Each card: one line, an icon (inline SVG), and a WhatsApp CTA with an event-specific pre-filled message. Add a note: "In-house décor & catering available, or bring your own setup."
5. **Stays (`#stays`):** compact and icon-led, understandable in 5 seconds — not a long paragraph. Comes **after** Celebrations, not before (overnight stays are the secondary use case for this villa; events/day-visits are the primary one). Layout: two columns on desktop (~55% content / ~45% photo, photo height matches the content column's height, max ~520px, object-fit:cover), photo stacked on top (16:9) on mobile — the same markup achieves both via CSS `order`, not duplicated markup. Content, top to bottom:
   - Eyebrow + H2 (`Weekend stays in Gorai`)
   - One short intro line (not a paragraph)
   - An 8-tile icon feature grid (`<ul>`, icons `aria-hidden="true"`, visible text labels) — entire villa, 4 bedrooms, 3 bathrooms, up to 15 guests, lawn & rooftop, games, kitchen + caretaker, parking. 4 columns × 2 rows on desktop, 2 columns on mobile. Lighter/smaller than the Celebrations cards.
   - Two small "good to know" chips (flexible check-in/out — or the real times once `site.json`'s `checkIn`/`checkOut` are both set — and a rates-vary note)
   - Three buttons: **WhatsApp** (filled primary), **Call** (outline secondary), **Book on Airbnb** (outline tertiary — see Section 3a)
   - Microcopy under the buttons steering celebrations/events to WhatsApp/call instead of Airbnb
   - Keep the schema `amenityFeature` in sync with whatever the tiles say.
6. **Nearby attractions (`#nearby`):** cards from `attractions.json` with name, one line, approximate distance/time, and a "Directions" link (`https://www.google.com/maps/dir/?api=1&destination=<encoded name or lat,lng>`). 6 cards (Gorai Beach, Global Vipassana Pagoda, EsselWorld & Water Kingdom, Manori Beach, Uttan Beach & Our Lady of Velankanni Shrine, Keshav Srushti). 3 columns × 2 rows on desktop, 2 columns on tablet, 1 column on mobile — 6 cards divides evenly into that grid, so there should never be an orphan card at this count; if the list length changes later and leaves one stranded in the final row, centre it rather than leaving it on one side.
7. **Location & how to reach (`#location`):**
    - **Google Maps embed iframe, loaded directly** (not a click-to-load facade): `loading="lazy"` so it only fetches once scrolled near, fixed height (~360px desktop, ~280px mobile) so there's no layout shift, rounded corners matching the card style, `title` and `referrerpolicy="no-referrer-when-downgrade"` set.
    - A single **"Get directions"** primary button (`googleDirectionsUrl`). Do not duplicate it with a separate "Open in Google Maps" button — one clear action only.
    - **How to reach, shown as one connected journey** (not three separate unconnected boxes): heading "By train + ferry (easiest from Borivali)", a stepper (horizontal on desktop, vertical timeline on mobile) connecting Borivali (W) Station → Gorai Jetty → Gorai side → Venkatesh Villa, with the mode and time written on each connector (Auto / Ferry · 5 min / Auto · 15 min). Mark it up as an ordered list (`<ol>`) with the connector labels as visible text, not icon-only. Below it, a separate small "Coming by car?" block with one line ("Google Maps will show you the best road route") and the same Get directions button.
    - Facts: from Borivali station, auto → Gorai Jetty → 5-minute ferry → auto (~15 min) to the villa. Gorai Beach is a 5-minute drive from the villa (state this once — in the section intro, the Gorai Beach nearby-attraction card and the FAQ; do not repeat it a fourth time in this section).
8. **Reviews (`#reviews`):** render real reviews from `reviews.json` with name, source (Google/Airbnb), month and text. Add a "Read more on Google" link and, after a stay, a "Leave us a Google review" link. **Do not add `AggregateRating`/`Review` schema for the business's own reviews**, because Google does not show self-serving review stars for LocalBusiness. Hide the section (and its nav link) if the array is empty. The villa's Google listing already has 4 genuine reviews (5.0). The owner may copy short excerpts into `reviews.json` with the reviewer's first name and a "View on Google" link to `googleMapsUrl`. Never invent or edit review text.
9. **FAQs (`#faq`):** H2 reads **"FAQs"**, no eyebrow label above it. An accessible accordion (`<details>/<summary>`) from `faq.json`. Visible HTML is mandatory. **Only one question open at a time** — give every `<details>` the same `name="faq"` attribute (current Chrome/Edge/Safari/Firefox enforce exclusivity from that alone, even with JS disabled); add a small JS `toggle`-event fallback that closes other open items, for older browsers. The first question is open by default. Opening an item must not leave its question hidden under the sticky header — correct the scroll position if needed, skipping the smooth animation under `prefers-reduced-motion`. See Section 7 for the schema decision.
10. **Contact (`#contact`):** a card with WhatsApp as the filled **primary** button and Call as the secondary **outline** button (not the other way round — WhatsApp is the primary conversion channel), plus Instagram and Google Maps links. Do **not** repeat the full street address here — the footer already carries the crawlable NAP block; keep this card to the action buttons and quick links only.
11. **Footer:** NAP again (as text, not an image), quick links (same order as the header nav), an "Airbnb" text link alongside Instagram and Google Maps (when `airbnbUrl` is set), © year, "Made with ♥ in Gorai".
12. **Floating WhatsApp button:** bottom-right on all viewports, 56px, high contrast, with `aria-label="Chat on WhatsApp"`. It must not cover content or the browser UI on iOS/Android (respect safe-area insets).

### 3a. Airbnb: secondary channel for stays only

WhatsApp and Call remain the primary booking channels everywhere on the site. Airbnb is a secondary, lower-emphasis option, shown **only in the Stays section**, as the third of its three buttons (WhatsApp filled primary, Call outline secondary, Airbnb outline tertiary), because Airbnb's own terms don't allow booking parties/events through a listing — only overnight stays.

- `site.json` carries `airbnbUrl`: the clean listing URL only (strip date/guest/share-id query parameters the owner's copied link may contain).
- Render it as a real **button** (not a text link), outline/ghost style, visually lighter than the filled WhatsApp button. Use a home icon or a small external-link icon — **never the Airbnb logo** (trademark). Give it `aria-label="Book Venkatesh Villa Gorai on Airbnb (opens in a new tab)"` in addition to its visible label, since "Book on Airbnb" alone doesn't convey that it opens a new tab. A short microcopy line below the three buttons (not attached to the button itself) notes that Airbnb is for overnight stays only and celebrations/events should go through WhatsApp/call.
- **Never** use Airbnb's official embed widget/script (`airbnb_jssdk`) — it's heavy third-party JS, adds Airbnb's own pricing/branding, causes layout shift, and needs extra CSP exceptions. Build a plain button/link instead.
- Airbnb does **not** appear in the hero, Celebrations, the floating button, or the header nav — stays-only (plus the footer link, see item 11 above).
- Add the clean URL to the villa's JSON-LD `sameAs` array (alongside Instagram and the Google Maps link) when set.
- Link with `target="_blank" rel="noopener"` (no `nofollow` — it's the owner's own listing).
- When `ga4Id` is set, clicking it fires a GA4 event `airbnb_click` with a `cta_location` param, kept separate from the `generate_lead` event used for WhatsApp/Call.

### WhatsApp link rules
- Format: `https://wa.me/919769541897?text=<encodeURIComponent(message)>`, built from `site.whatsappNumber`.
- Pre-filled messages (in `content.json`, editable):
  - Stay: `Hi! I found Venkatesh Villa Gorai on your website. I'd like to check availability for a stay. Dates: __ | Guests: __`
  - Event: `Hi! I'd like to plan a {event} at Venkatesh Villa Gorai. Date: __ | Guests: __`
  - General: `Hi! I have a question about Venkatesh Villa Gorai.`
- Open in a new tab with `rel="noopener"`.
- Fire a GA4 event `generate_lead` with param `method: whatsapp|call` and `cta_location` on click (only when `ga4Id` is set).

---

## 4. Starting copy (put in data files; the owner can edit)

**Gallery captions for the named spots (use as `caption` in `gallery.json` when the owner adds these photos; file names in brackets):**
| caption (name) | floor | line (alt text should describe the photo, e.g. "Wooden garden gazebo at Venkatesh Villa Gorai") |
|---|---|---|
| Kashi Kutir [kashi-kutir.jpg] | Ground floor | Our wooden gazebo in the garden, made for long chai chats |
| Savan Jhula [savan-jhula.jpg] | Ground floor | A garden swing under the palms, for endless jhoola sessions |
| Lawn [lawn.jpg] | Ground floor | Barefoot evenings on soft green grass lined with coconut trees |
| Food Court [food-court.jpg] | First floor | A covered dining deck with a green view, where chai turns into dinner plans |
| Balcony [balcony.jpg] | First floor | Banana trees, breeze and a quiet sip |
| Vrindavan [vrindavan-terrace.jpg] | Terrace | Our rooftop garden with green turf and wooden seating, for sunsets & sangeet nights |
| Tirumala Hills [tirumala-hills.jpg] | The very top | A tiny lookout above the terrace: the highest chai in Gorai and the best view in the house |

Caption format in the carousel: **Name** · Floor: line. When a file name matches one of these, the sync script pre-fills its caption and alt text from this table.

**Nearby attractions (`attractions.json`).** Compute approximate drive times from the villa's `geo` (19.23419, 72.78656) and label them "approx.". Verify every name.
- Gorai Beach: sunsets and evening walks, **5-minute drive** (owner-confirmed)
- Global Vipassana Pagoda: landmark golden pagoda and meditation centre
- EsselWorld & Water Kingdom: amusement and water parks
- Manori Beach: a quieter beach and seafood shacks
- Uttan Beach & Our Lady of Velankanni Shrine (Uttan): hilltop shrine with sea views
- Keshav Srushti (Uttan, Bhayandar West): a sprawling green campus with nature trails, a medicinal plant garden, a heritage lake and a gaushala

That's 6 cards, in that order — enough to fill a 3×2 grid evenly on desktop with no orphan. Two were deliberately left out, neither as a drive-by cut:
- The Gorai–Borivali ferry jetty is **not** its own attraction card — it duplicates the "How to reach" section's stepper and isn't an attraction in its own right.
- "Gorai mangroves & village lanes" was removed in Round 2 (owner decision) to bring the count to a clean 6 for the 3-column grid.

**Tone:** warm, simple, Mumbai-family voice, English with light Hinglish where natural ("chai", "jhoola"). No exaggeration.

**Honesty rules (they protect reviews and rankings):**
- **There is no swimming pool yet.** Never show, imply or target one in the title, meta, headings, alt text, schema or images. The **only** place a pool is mentioned is the FAQ answer below (planned for the future).
- Say "near Gorai Beach" with the real distance, not "beachfront".
- Only mention amenities confirmed in `content.json`.

**FAQ (`faq.json`): final, owner-approved answers. Keep this exact meaning; light copy polish is fine.** Order:

1. **What is the guest capacity for stays and events?**
   For overnight stays, the villa comfortably hosts **up to 15 guests**. For day events and celebrations, our lawn, rooftop terrace and dining deck can welcome **50+ guests**, with seating and arrangements already in place. Share your guest count and plans with us on WhatsApp or call, and we'll suggest the best setup for your group.

2. **Is there a swimming pool at the villa?**
   Not yet. A pool is part of our upcoming plans. Meanwhile, guests love the open lawn, the rooftop terrace, the garden swing, and games like badminton and table tennis.

3. **How far is the villa from Gorai Beach?**
   Just a **5-minute drive**, close enough for a sunset walk and quiet enough to unwind.

4. **What are the food and catering options?**
   The villa has a **fully operational kitchen**, and food menus are available at the property. You can also order from our **tie-up partners** nearby, or through **Zomato and Swiggy**.

5. **Can we bring our own decorator or caterer?**
   Absolutely. We offer in-house décor and catering options, and you're equally welcome to bring your own decorator, caterer or setup. Share your plan with us on WhatsApp or call, and we'll help coordinate the space, timings and arrangements.

6. **How do we reach the villa from Borivali station?**
   Auto to Gorai Jetty → 5-minute ferry → 15-minute auto to the villa. See "How to reach" above for the full route, or tap Get directions if you're driving. (Link "How to reach" to `#location`.)

7. **How do we book?**
   Message us on WhatsApp or call with your dates, group size and occasion. We'll confirm availability and share the details.

Optional (add only when the owner provides answers): check-in/check-out times, music timings, parking, house rules.

---

## 5. Visual design

**The Google Stitch references in `design-references/` take priority for all visual decisions (Section 0.2).** Use the defaults below only for anything the references don't show.

- **Fallback brand palette (from the logo):** terracotta `#B4532F`, deep palm green `#2F5D50`, sunset gold `#E8A445`, ink `#2B2420`, cream background `#F7F0E3`. Define them as CSS custom properties. Meet WCAG AA contrast: test the white-on-terracotta buttons and darken them if they fail. This includes the WhatsApp button's own brand green — if it fails white-text/icon contrast, use a darker shade of the same hue (e.g. WhatsApp's own darker teal) rather than leaving it failing.
- **Fonts:** use the fonts from the design references. Fallback: Playfair Display (headings) + Inter (body). **Self-host WOFF2** (subset to Latin), use `font-display: swap`, preload only the heading weight used above the fold, and adjust the fallback metrics to avoid CLS. No Google Fonts `<link>` (privacy and performance).
- Mobile-first. Test at 360, 390, 768, 1024 and 1440px widths. No horizontal scroll. Tap targets at least 44×44px.
- Feel: airy, photo-led, rounded corners, soft shadows. Light theme by default; a dark theme is optional.
- Add a basic `@media print` style so the hero heading/sub-text stay readable when the page is printed or exported to PDF.
- Brand assets go in `src/assets/brand/`: `logo.svg` (or PNG), `logo-white.png`, favicon sources. Generate favicon.ico (32), icon.svg, apple-touch-icon (180) and icons 192/512 for `site.webmanifest`.

---

## 6. Photos and the admin (carousel) workflow

### Folder layout
```
src/images/gallery/      ← carousel photos (owner drops JPG/PNG/HEIC→JPG here)
src/images/site/         ← hero fallback, OG image source, map placeholder
src/_data/gallery.json   ← order, captions, alt text, show/hide
```

### `gallery.json` schema
```json
{
  "autoplay": false,
  "intervalSeconds": 5,
  "slides": [
    { "file": "front-dusk.jpg", "alt": "Venkatesh Villa Gorai front view at sunset with palm trees", "caption": "Welcome home, Gorai", "show": true, "hero": true },
    { "file": "rooftop-gazebo.jpg", "alt": "Rooftop gazebo with wooden seating and green turf at Venkatesh Villa", "caption": "Vrindavan, our rooftop", "show": true }
  ]
}
```

### Admin options (implement A and B; document both in the README)
**A. Zero-setup (default): edit on GitHub.com**
- Owner uploads photos to `src/images/gallery/` using GitHub's "Add file → Upload files".
- **Auto-sync script** (`scripts/sync-gallery.mjs`, run automatically before every build, locally and in CI):
  - Adds any new image in the folder to `gallery.json` with `show: true`, a generated alt text based on the file name (e.g. `rooftop-gazebo.jpg` → "Rooftop gazebo at Venkatesh Villa Gorai"), and the caption set to empty.
  - Marks entries whose file has been deleted as missing, and skips them (never crashes the build).
  - Never overwrites alt text or captions the owner has already written.
- To reorder, hide or caption photos, the owner edits `gallery.json` on GitHub. The README shows exactly which lines to change, with a screenshot-style example.
- On every push to `main`, the GitHub Action rebuilds and the live site updates in about 2 minutes.

**B. Friendly admin panel: Pages CMS** (free hosted app at app.pagescms.org; sign in with GitHub; open-source; verify current terms)
- Add `.pages.yml` at the repo root: media `input: src/images/gallery`, and an editable `file` entry for `src/_data/gallery.json` with a list field of objects (`file` image, `alt` string, `caption` string, `show` boolean, `hero` boolean). Also add editable entries for `site.json`, `content.json`, `faq.json` and `reviews.json`.
- **Check the current Pages CMS docs for the exact list/object field syntax**, and test that saving in Pages CMS commits valid JSON and triggers the deploy.
- Result: the owner logs in, uploads a photo, types the alt text and caption, drags to reorder, presses Save, and the site redeploys.

### Image pipeline rules (build time)
- Accept JPG, JPEG, PNG and WebP. Auto-rotate using EXIF, then **strip EXIF/GPS metadata** for privacy.
- Output AVIF + WebP + JPEG at widths 480, 768, 1080, 1600 and 2000. Use `<picture>` with `srcset` + `sizes`, and set `width`/`height` attributes. Never add a width to an image's srcset range larger than what was actually requested for that usage (e.g. a small thumbnail asking for `widths: [120]` must not silently also get the image's full original resolution appended — that defeats the point of requesting a small width and wastes bandwidth).
- Hero: `fetchpriority="high"`, `loading="eager"`, `decoding="async"`, plus a preload link for the matching size. All other images: `loading="lazy"`.
- Target under 200 KB for a 1080px WebP. Warn in the build log if any source file is over 8 MB or narrower than 1600px.
- Output file names are SEO-friendly and descriptive (based on the source name), e.g. `venkatesh-villa-gorai-rooftop-gazebo-1080.webp`.
- Generate the **OG image** (1200×630 JPEG, under 300 KB) from the hero image, with the villa name overlaid. WhatsApp and Instagram link previews use this image, which matters because this site will mostly be shared on WhatsApp.

---

## 7. SEO specification (mandatory; this is the core of the project)

### 7.1 Context and strategy (from live research, Oct 2026)
- Google autocomplete for this area shows demand around: **"villa in gorai"** (plus *for party, for picnic, for family, budget, on rent*), **"gorai beach villa"** (plus *booking, contact number, for family*), **"gorai one day picnic"**, **"gorai party place / 31st party / new year party"**, **"gorai resorts for group"**, **"villa for birthday party in mumbai"**, **"party halls in gorai"**, **"engagement hall in borivali west"**, **"one day picnic spot near borivali"**.
- **"venkatesh villa" on its own** is dominated by Pune housing societies (Warje, Baner, Pashan). Always use the full entity name **"Venkatesh Villa Gorai"** in the title, H1, schema `name`, OG title and footer, so Google can tell this business apart.
- "Bungalow in gorai" searches are mostly about buying property. Do **not** target "bungalow".
- A very large share of villa searches add "with private pool". **We have no pool.** Target party, picnic, family, group, event and sunset intent instead.
- Google results for "villa in gorai for party" are led by the **Google Maps local pack** (listings with the "Villa" category and lots of reviews), followed by OTAs (Airbnb, MakeMyTrip, Booking.com, Goibibo, Justdial, StayVista, Agoda, Tripadvisor) and Instagram. **A single-page site will not out-rank the OTAs for the broad terms.** Its jobs are to:
  1. be the strong, relevant **website linked from the Google Business Profile** (this boosts local-pack relevance),
  2. win **brand searches** ("venkatesh villa gorai") and **long-tail event searches** (haldi, mehendi, birthday, team outing, one-day picnic in Gorai/Borivali), where results are currently weak ("Missing: birthday haldi"),
  3. convert visitors to WhatsApp leads and be easy for AI answer engines to read.

### 7.2 On-page essentials
- `<title>` (50–60 chars): `Venkatesh Villa Gorai | Private Villa for Stays & Events, Mumbai`
- Meta description (140–160 chars): `Private 4BHK villa near Gorai Beach, Mumbai. Lawn, rooftop gazebo & games for weekend stays, birthdays, haldi, mehendi & team outings. WhatsApp to book.`
- One H1 (Section 3). Each H2 naturally includes one relevant phrase, for example:
  - `Weekend stays in Gorai`
  - `Birthday parties, haldi & mehendi at our villa`
  - `Nearby attractions in Gorai`
  - `How to reach Venkatesh Villa from Borivali`
  - `FAQs` (the actual H2 text, per Section 3 item 9 — short on purpose, the SEO phrase-matching here matters less for a heading this generic)
- Body copy of **600–1,000 visible words** in total across sections. Mention each target phrase **once or twice, naturally**. No keyword stuffing, no hidden text, no blocks of city or area names.
- Mention nearby place names where they are genuinely useful (Gorai Beach, Borivali West, Manori, Uttan, Mira–Bhayandar, Global Vipassana Pagoda, EsselWorld). This builds local relevance.
- Include the alternate spellings "Vyankatesh / व्यंकटेश" **once**, in a natural sentence (e.g. "Venkatesh Villa Gorai (व्यंकटेश व्हिला)").
- **NAP** (name, address, phone) as crawlable text in the footer, identical to Google Business Profile, Justdial, OTA listings and Instagram. (The contact section's card should not duplicate the full address — keep it to actions/links, so the footer stays the one authoritative crawlable NAP block.)
- Descriptive alt text on every image (what is shown + "Venkatesh Villa Gorai" where natural). Decorative images get `alt=""`.
- Use internal anchor links with descriptive text. External links (Maps, Instagram, OTAs, Airbnb) get `rel="noopener"`.
- Canonical: `<link rel="canonical" href="{baseUrl}/">`.
- `meta viewport`, `meta theme-color` (#2F5D50), `<html lang="en-IN">`.

### 7.3 Structured data (JSON-LD in `<head>`, generated from data files)
Output **one `@graph`**:
1. **`["LodgingBusiness", "EventVenue"]` node** (multiple types are allowed; use the most specific types):
   - `@id`: `{baseUrl}/#villa`, `name`, `alternateName`, `description`, `url`, `telephone` (E.164), `email` (if set)
   - `image` (array of 3+ absolute URLs: 16:9, 4:3, 1:1 crops of the hero)
   - `logo`
   - `address` (PostalAddress)
   - `geo` (GeoCoordinates with **at least 5 decimals**; omit if TODO)
   - `hasMap` (googleMapsUrl)
   - `telephone`: phoneE164 (matches Google listing). Include the WhatsApp number in visible text only.
   - `priceRange` (**under 100 chars**)
   - `checkinTime` / `checkoutTime`
   - `numberOfRooms: 4`
   - `amenityFeature` (LocationFeatureSpecification list): **only amenities that are visibly mentioned on the page** (hero chips + Stays/Celebrations/FAQ text), e.g. Lawn, Rooftop terrace, Badminton, Table tennis, Kitchen.
   - `maximumAttendeeCapacity`: 50 (events); state overnight capacity (15) in the visible text
   - `sameAs` (Instagram, Google Maps, Airbnb, other OTA URLs that are set)
   - `areaServed`: "Mumbai"
   - `containedInPlace`: `{ "@type": "Place", "name": "Gorai, Borivali West, Mumbai" }`
   - **No `aggregateRating` / `review`** (self-serving reviews are not eligible).
2. **`WebSite`** node (`@id` `{baseUrl}/#website`, name, url, inLanguage `en-IN`, publisher → villa).
3. **`WebPage`** node (`@id` `{baseUrl}/#webpage`, about → villa, primaryImageOfPage, isPartOf → website, datePublished/dateModified from build time).
4. **`FAQPage`**, *optional*, generated from `faq.json`, matching the visible FAQ text exactly. Note: **Google stopped showing FAQ rich results in May 2026**, so this markup gives no rich snippet. Keep it only as harmless machine-readable context. The visible FAQ is what matters.
5. **Do not** use `VacationRental` markup. Google restricts it to approved partners connected through Hotel Center.
- Validate with the Schema.org validator and Google's Rich Results Test (Section 12). There must be zero errors. Never mark up anything that isn't visible on the page.

### 7.4 Social / sharing meta
- Open Graph: `og:type=website`, `og:site_name`, `og:title`, `og:description`, `og:url`, `og:image` (1200×630 absolute URL), `og:image:alt`, `og:locale=en_IN`.
- Twitter: `summary_large_image`.
- Test the preview by pasting the URL into WhatsApp. It must show the image, title and description.

### 7.5 Technical SEO files
- `robots.txt`: when indexable, allow all and add `Sitemap: {baseUrl}/sitemap.xml`. When not indexable, `Disallow: /`.
- `sitemap.xml`: the single URL with `<lastmod>` = build date, plus `<image:image>` entries for the gallery images.
- A `404.html` with branding and links back home. Add `site.webmanifest`.
- Clean URLs. HTTPS only (GitHub Pages "Enforce HTTPS").
- Exactly one indexable URL: avoid duplicate `index.html` vs `/` (canonical handles this).
- Add Search Console and Bing verification `<meta>` tags from config (render only if set).
- **Staging rule:** keep `indexable: false` while on the github.io URL. When the domain goes live: set `baseUrl` + `indexable: true`, add the CNAME, submit the sitemap in Search Console, and request indexing.

### 7.6 Performance targets (Core Web Vitals "good" thresholds)
- **LCP < 2.5s, INP < 200ms, CLS < 0.1** on a mid-range Android over 4G.
- Lighthouse (mobile) **≥ 95** for Performance, Accessibility, Best Practices and SEO.
- Total JS ≤ 30 KB gzipped, deferred. Critical CSS inlined (or a single small CSS file). No render-blocking third parties.
- GA4 loads after user interaction or idle (`requestIdleCallback`), never blocking LCP.
- The Maps embed iframe uses `loading="lazy"` so it isn't fetched until the visitor scrolls near it; it does not need a click-to-load facade on top of that.
- **Never load the Airbnb embed widget script** — a plain static link only (see Section 3a).
- Set correct cache headers (GitHub Pages defaults) and fingerprinted asset file names.

### 7.7 Accessibility (also a quality signal)
- WCAG 2.2 AA: keyboard reachable, visible focus, skip-to-content link (the link's target must be focusable, e.g. `tabindex="-1"` on `<main>`, so activating it actually moves keyboard focus there and not just the scroll position), ARIA for the carousel (`aria-roledescription="carousel"`, slide labels "3 of 12"), live region for slide changes only when the user navigates manually, and `<details>` for the FAQ. The "how to reach" stepper is a connected, ordered journey (`<ol>`) with its connector labels (mode + time) as visible text, not icon-only.
- Contrast checked; all tap targets at least 44px.
- No page element may cause horizontal scroll at 360px width — in particular, an off-canvas mobile nav panel (`position: fixed`, translated off-screen) or an internally-scrollable carousel track must not leak into the document's own scrollable width. `overflow-x: hidden` on `html`/`body` is an acceptable safety net as long as it doesn't clip anything that's supposed to be visible.

### 7.8 Off-site SEO checklist (put in the README; the owner does these, not code)
1. **Google Business Profile: a listing already exists** ("Venkatesh villa", Holiday home, 5.0 ★ from 4 reviews). Claim or verify ownership of *this* listing; do not create a new one (duplicates hurt rankings). Then:
   - Fix the "Located in: Margaret Villa" line (Suggest an edit) if it's wrong.
   - Add the website URL once it's live.
   - Make sure the phone number matches the one on the website.
   - To rename it to "Venkatesh Villa Gorai", first put that exact name on the gate signboard (Google requires the real-world name).
   - Category: local competitors rank in the map pack under the category **"Villa"**, so pick the primary category from what Google offers (e.g. "Villa") and add "Event venue" as secondary if available. Website = this site, with UTM `?utm_source=gbp&utm_medium=organic`. Add 20+ photos, services (Birthday party, Haldi, Mehendi, Team outing, Day picnic), and weekly posts.
2. **Reviews:** ask every real guest. Never post reviews from friends or family, or reviews that were paid for or given in exchange for a discount (Google's conflict-of-interest and incentive rules).
3. **Consistent NAP** on Justdial, WedMeGood, Airbnb, Booking.com, MakeMyTrip, Instagram and Facebook.
4. Put the website link in the Instagram bio, the WhatsApp Business profile and the OTA host profiles (where allowed).
5. Collaborate with local Instagram travel creators (Google is surfacing their reels for "one day picnic Gorai" searches).

---

## 8. Security and privacy
- No secrets in the repo. The GA4 ID and verification tokens are public by nature.
- Set a Content Security Policy via `<meta http-equiv>`: allow self, Google Analytics domains (if enabled), and google.com/maps for the map iframe only.
- Strip EXIF/GPS from all photos (Section 6).
- External links use `rel="noopener noreferrer"`.
- Add a short privacy note in the footer if GA4 is enabled.

---

## 9. Deployment

### Local
```
npm install
npm start            # http://localhost:8080
npm run build && npm run check
```

### GitHub Pages (free, now)
- Workflow `.github/workflows/deploy.yml`: on push to `main` → `npm ci` → `npm run build` (with `PATH_PREFIX=/<repo>/`) → upload the artifact → deploy with the official `actions/deploy-pages`. Repo Settings → Pages → Source: "GitHub Actions".
- Also run `npm run check` in CI. **Fail the build** if the Lighthouse SEO or Accessibility score is below 95, or if HTML is invalid. (In practice: `indexable: false` during staging legitimately drops the SEO score via the `is-crawlable` audit — this is correct, not a bug, so a strict SEO gate should not block deploys while staging; gate hard on the audits that matter regardless of the indexable toggle, such as title/meta description/canonical/alt text/link text, and treat the overall SEO category score as informational until the site is meant to be indexed.)

### Custom domain (later)
- Add `src/CNAME` containing the domain (copied to the output root), and set `PATH_PREFIX=/`, `baseUrl`, and `indexable: true`.
- DNS: GitHub Pages A records + `www` CNAME. **Check the current values in GitHub's docs at that time.**
- Settings → Pages → Custom domain → Enforce HTTPS.
- Submit the sitemap in Google Search Console and Bing Webmaster Tools.

---

## 10. Repository layout (target)
```
AGENTS.md            ← this file (Codex)
CLAUDE.md             ← one line: @AGENTS.md (Claude Code)
HANDOFF.md            ← progress log for agent switching (Section 0.1)
DESIGN_NOTES.md        ← design token extraction + deviations (Section 0.2)
design-references/     ← Google Stitch screenshots / exports (owner-provided, not deployed)
.github/workflows/deploy.yml
.pages.yml
eleventy.config.js
package.json
scripts/sync-gallery.mjs
src/
  index.njk
  404.njk
  robots.txt.njk
  sitemap.xml.njk
  site.webmanifest.njk
  _includes/ (layouts + section partials + schema.njk + meta.njk)
  _data/ site.json content.json gallery.json attractions.json faq.json reviews.json
  assets/ css/ js/ fonts/ brand/
  images/ gallery/ site/
README.md
```

---

## 11. README for the owner (write it in plain English)
It must include these sections:
1. **What this is**, with a screenshot of the site.
2. **See it on your computer:** install Node (link), then `npm install` and `npm start`.
3. **Change carousel photos:**
   - (a) GitHub upload, step by step
   - (b) Pages CMS, step by step
   - (c) how to reorder, hide or caption photos in `gallery.json`
4. **Change text, phone or prices:** which file and which line.
5. **Go live on GitHub Pages:** click-by-click.
6. **Connect your domain later:** what to buy, DNS steps, and flipping `indexable` to true.
7. **After launch SEO checklist** (Section 7.8).
8. **Troubleshooting:** the build failed, a photo isn't showing, the WhatsApp preview has no image.

---

## 12. Definition of done: run and pass all of these
- [ ] Side-by-side screenshots (390px and 1440px) match the Stitch references section by section; every difference is listed in `DESIGN_NOTES.md` → Deviations with a reason.
- [ ] `design-references/` is **not** copied into `_site` (not deployed).
- [ ] `HANDOFF.md` is up to date, all steps are checked, and everything is committed.
- [ ] `npm run build` succeeds with zero warnings about missing images, and **no "TODO" text in `_site/index.html`**.
- [ ] HTML validates (html-validate or the W3C Nu checker). No broken internal anchors or links (linkinator or similar).
- [ ] Lighthouse CI (mobile): Performance ≥ 95, Accessibility ≥ 95, Best Practices ≥ 95, SEO = 100 (once `indexable: true`).
- [ ] JSON-LD parses and validates (Schema.org validator); Rich Results Test shows no errors.
- [ ] Exactly one H1; heading order is logical; every `<img>` has `alt` plus `width`/`height`.
- [ ] Carousel images are present in the raw HTML (view-source), not only after JS runs.
- [ ] Works with JS disabled: all content is visible and the carousel degrades to a scrollable row.
- [ ] Keyboard-only walkthrough passes, including the skip-to-content link actually moving focus to `<main>`; `prefers-reduced-motion` respected.
- [ ] 360px-width layout has no horizontal scroll; floating WhatsApp button doesn't cover CTAs.
- [ ] WhatsApp links open with the correct number and the pre-filled text URL-encoded; the `tel:` link works.
- [ ] Adding a new photo to `src/images/gallery/` and rebuilding adds it to the carousel automatically; deleting one removes it without breaking the build.
- [ ] `indexable:false` → noindex meta tag and disallow-all robots.txt; `indexable:true` → indexable, sitemap present, canonical = baseUrl.
- [ ] The map iframe is marked `loading="lazy"` and isn't fetched until scrolled near (check the Network tab).
- [ ] The word "pool" appears **only** in FAQ answer #2 and its matching FAQPage markup (grep the output: title, meta, alt text, headings and the villa schema must be clean).
- [ ] The removed sections (Spaces grid, Amenities grid, Food section) are **not** on the page.
- [ ] Celebrations shows exactly 8 cards (4×2 on desktop) in the order given in Section 3; Stays comes after Celebrations, not before; Nearby shows exactly 6 cards in a 3×2 grid on desktop.
- [ ] The "how to reach" stepper reads as one connected journey (not three separate boxes) on both 390px and 1440px.
- [ ] Every address link opens `googleMapsUrl`; every "Get directions" opens `googleDirectionsUrl`; the Call button uses +91 98212 95016; WhatsApp uses +91 97695 41897; the Airbnb link (Stays section's "Book on Airbnb" button + footer link) uses the clean `airbnbUrl` with no embed script loaded.
- [ ] Only one FAQ item is open at a time (test by clicking a second question — the first must close), and this still holds with JavaScript disabled.
- [ ] The Stays section is compact: roughly one screen height or less at 1440px, and visibly shorter than a long-paragraph layout at 390px, with no overlapping/overlaid card.
- [ ] The page builds and works under a github.io sub-path and at the root.

When finished, reply with: what you built, how to run it, the Lighthouse scores, the list of every remaining `TODO_OWNER` value, and the next three steps for the owner.
