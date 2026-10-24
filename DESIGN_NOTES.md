# Design notes: Venkatesh Villa Gorai

## Mobile review — 24 October 2026

Owner's four phone screenshots supersede the original mobile adaptation.
They show oversized event cards, lengthy nearby cards, a tall centred travel
route, and an overcrowded hero. Desktop styling is explicitly preserved.

- Phone-only overrides apply below 768px; the original colours, fonts, photos,
  section order and desktop layouts remain. Section spacing is 40px, card gaps
  12px, and event cards use compact 18px headings and 13px descriptions.
- Hero: short brand H1 and 4BHK/location eyebrow, no byline on phones, two
  aligned CTAs, a 2×2 amenity grid and a light caretaker line. Height at 390px
  drops from 916px to 580px, leaving substantially more of the photo visible.
- Events: eight equal-height cards in two columns; short descriptions and
  an Enquire link with an event-specific accessible WhatsApp label. Haldi,
  mehendi and sangeet remain one event option. Desktop copy stays intact.
- Nearby: six compact rows with an icon column and readable place names;
  distance and directions align below. No truncated names or text clamping.
- Route: left-aligned ordered timeline with each travel mode/time between
  its stops, replacing the tall centred mobile layout.
- Stays: aligned icon tiles and a two-column WhatsApp/Call action row; Airbnb
  spans the row below. Contact uses two labelled action tiles with phone numbers.
- FAQs and footer receive phone spacing and properly wrapping navigation.
- Floating WhatsApp yields to visible in-page WhatsApp actions on phones;
  desktop is unchanged and the no-JS fallback keeps the floating shortcut.

All abbreviated copy is in `copy.json` (`mobile*` keys) or `attractions.json`
(`mobileLine`). The responsive-copy macro uses CSS display switching, so only
one version is exposed to assistive technology. One H1 remains; title/meta,
canonical, FAQ text, phone numbers and booking destinations are unchanged.

Screenshots, comparison metrics and Playwright checks are stored locally in
`design-references/mobile-review/` (ignored by Git and never deployed).
Before/after 1440px screenshots of Hero, Events, Stays, Nearby, Location and
FAQs are pixel-identical; Contact has identical dimensions and only a tiny
text rasterization difference from its inline wrappers.

Intentional deviations: the phone H1 and headings are shortened, the hero
byline is hidden, and the floating shortcut is suppressed while another
WhatsApp action is visible, following this explicit owner review.

## Source

`design-references/stitch/` contains the Google Stitch export:
- `DESIGN.md` — design-system tokens (colors, type scale, spacing, radii, shadow character, component styles)
- `code.html` — a full Tailwind-based one-page mockup of the site
- `screen.png` — rendered screenshot of that mockup

This mockup is the primary visual source of truth (AGENTS.md Section 0.2). It was built from a single long desktop-width screenshot — no separate mobile reference was supplied, so mobile layout is adapted responsively in the same visual language (stacked single-column, same colors/type/radii/shadows).

## Section map (Stitch mockup -> build section)

| Stitch section (`id`) | Used in build as |
|---|---|
| header | Sticky header/nav |
| `#home` hero | Hero (`#home`) |
| `#gallery` | Gallery carousel (`#gallery`) |
| `#stays` | Stays (`#stays`) |
| `#celebrations` | Celebrations & events (`#celebrations`) |
| `#spaces` | **Removed** — see Deviations |
| `#amenities` | **Removed** — see Deviations |
| `#food` | **Removed** — see Deviations |
| `#nearby` | Nearby attractions (`#nearby`) |
| `#location` | Location & how to reach (`#location`) |
| `#reviews` | Reviews (`#reviews`) — empty until real reviews are added |
| `#faq` | FAQ (`#faq`) |
| `#contact` + footer | Contact (`#contact`) + Footer |
| floating WhatsApp button | kept, same position/style |

## Extracted design tokens (-> `src/assets/css/tokens.css`)

Colors (Material-3-style token names from `DESIGN.md`, mapped to CSS custom properties):
- primary `#943c19`, primary-container (brand terracotta) `#b4532f`, on-primary `#ffffff`
- secondary (palm green) `#396759`, secondary-container `#b9ead9`
- tertiary (sunset gold) `#7b4e00` / tertiary-container `#9c6400`
- surface `#fff8f6`, surface-container-low `#fff1ec`, surface-container `#fdeae4`, surface-container-high `#f7e4de`
- on-surface (ink) `#231916`, on-surface-variant `#56423c`, outline `#89726b`, outline-variant `#dcc1b8`
- background `#fff8f6`

These are very close to the AGENTS.md fallback palette (terracotta `#B4532F`, palm green `#2F5D50`, sunset gold `#E8A445`, ink `#2B2420`, cream `#F7F0E3`) — the Stitch tokens were used as-is since they are the actual design source, with the AGENTS.md fallback values kept as secondary aliases for anything the design doesn't define.

Typography: Playfair Display (headings, 500-600 weight) + Inter (body/labels). Scale: headline-xl 56/64, headline-lg 40/48, headline-md 32/40, headline-sm 24/32, body-lg 18/28, body-md 16/24, body-sm 14/20, label-md 14/20, label-sm 12/16. Mobile: headline-xl -> 36px, headline-lg -> 28px (per `DESIGN.md`).

Spacing: gutter 1.5rem, margin 2rem, space-xs .25rem, space-sm .5rem, space-md 1rem, space-lg 2rem, space-xl 4rem.

Radius: DEFAULT .25rem (small controls), lg .5rem, xl .75rem (in Stitch's Tailwind config) — `DESIGN.md`'s prose additionally describes 1rem cards / 1.5rem hero imagery; the built tokens.css uses the richer prose scale (sm .25rem / md .75rem / lg 1rem / xl 1.5rem / full pill) since it better matches the rounded photo cards and hero frame actually drawn in `code.html`.

Shadows: soft, low-opacity ink/green tints, 16-32px blur (ambient, no hard drop shadows).

Icons: Material Symbols Outlined in the mockup. Rebuilt as a small inline-SVG set (`src/_includes/partials/icons.njk`) instead of loading Google's Material Symbols font, to keep the font-loading rule (self-hosted only, no extra Google Fonts `<link>`) and the JS budget in Section 7.6.

## Deviations from the Stitch mockup

Required by AGENTS.md, so the build wins over the design here:

1. **"Discover Our Named Spaces" grid removed.** Owner decision (AGENTS.md Section 3 "Removed sections"). The same named spots (Kashi Kutir, Savan Jhula, Lawn, Food Court, Balcony, Vrindavan Terrace, Tirumala Hills) appear only as gallery captions when photographed.
2. **"World-Class Comforts" amenities icon grid removed.** Owner decision. Key amenities instead appear as hero trust chips and inline in the Stays/Celebrations copy.
3. **"Culinary Experience" / food section removed.** Owner decision. Food is covered in FAQ #4 only.
4. **No swimming pool anywhere.** The Stitch hero image and copy evoke a "coastal sanctuary" but never literally shows a pool, so no image changed; however, all "Private Pool"-style chip/badge ideas from `DESIGN.md`'s own component examples were not used, and FAQ #2 is the only place "pool" appears, exactly as required.
5. **Invented reviews replaced with an empty state.** The mockup's 3 testimonials (Pooja Shah, Rohit Mehta, Aniket Deshmukh) are Stitch placeholder content. `reviews.json` ships as `[]` and the Reviews section hides until the owner pastes in real excerpts from the villa's actual Google reviews (per AGENTS.md: never invent/edit review text). No `AggregateRating`/`Review` schema is emitted, per spec.
6. **Header nav + "Spaces" link removed**, since the Spaces section was removed; nav otherwise follows the mockup's order (Gallery, Stays, Celebrations, Nearby, Location, FAQ, Contact), with Reviews added since that section exists in the build.
7. **Material Symbols icon font dropped** in favor of inline SVG (performance + self-hosting rule, Section 7.6/0.2 point 4 "required features... design them in the same visual language").
8. **Google Fonts `<link>` dropped**; Playfair Display + Inter are self-hosted WOFF2 (Section 7.6), same families/weights as the mockup.
9. **Hero image**: the mockup uses an AI-generated dusk villa illustration. The real property photo `venkatesh-villa-gorai-front-dusk.png` (actual sunset facade shot of the villa) is used instead — real content per Section 0.2's content rule.
10. **Gallery image set**: the mockup shows 5 generic stock interior photos (master suite, rooftop gazebo, lawn, living room, dining deck) with invented captions. These were replaced with the 6 real property photos available (see `HANDOFF.md` for the list); captions describe what is actually shown instead of the mockup's invented room names, except where a real photo matches a named spot from AGENTS.md Section 4 (Kashi Kutir gazebo).
11. **Two Property Images excluded from the public gallery**: `Property Images/unnamed (1).webp` (a lit night-time event with identifiable guests) and `unnamed (2).webp` (villa facade with a personal 75th-birthday banner showing family photos). Both depict a specific private family celebration with recognizable people rather than generic marketing shots of the property, so they were left out of the public site for the guests' privacy. Owner note added to README asking for face-free event/decor photos if they'd like a "celebrations in action" shot added later.
12. **Two near-duplicate facade shots both kept** (dusk + daytime) since both are genuinely useful (hero + daylight context) rather than invented filler.
13. **Stitch's "Load Interactive Map" button behaviour (`onclick="alert(...)"`)** replaced with a real click-to-load Google Maps iframe facade per Section 3.7 / 7.6 (no heavy iframe on page load).
14. **Contact section phone number**: the mockup only showed the WhatsApp number for both "Chat" and "Call" buttons. Per AGENTS.md Section 2, Call uses `phoneE164` (+91 98212 95016, matching the Google Business listing) and WhatsApp uses `whatsappNumber` (+91 97695 41897) — shown as two clearly labelled buttons.

## Section order (final, matches the mockup minus removed sections)

Header -> Hero -> Gallery -> Stays -> Celebrations -> Nearby -> Location -> Reviews (hidden while empty) -> FAQ -> Contact -> Footer, with a floating WhatsApp button throughout.
