# 07 · Responsive system

The live site was built for desktop only. This doc and `designs/Responsive System.dc.html` (open it in a browser; it is a pan-and-zoom board) define how every page adapts from a 320 px phone to a 3440 px ultrawide. Frames on the board are drawn at true pixel size, and gold numbers on each frame match the notes under it. Where this doc and the board disagree, the board wins.

**The shipped design does not change.** Everything from 1280 to 2399 px (including the 2233 px monitor in `screenshots-xl/`) must look exactly as it does now. All work here is additive.

## Tiers

| Tier | Width | Devices | Design width |
| --- | --- | --- | --- |
| XS | 320–479 | phones in portrait | 390 |
| S | 480–767 | phones in landscape, foldables, iPad mini portrait | 600 / 844 × 390 |
| M | 768–1023 | tablets in portrait | 834 |
| L | 1024–1279 | tablets in landscape, iPad Pro portrait, small laptops | 1194 |
| XL | 1280–2399 | laptops and desktops (**shipped**) | 1440 / 2233 |
| XXL | 2400–3199 | QHD 2560, 5K scaled to 2880 | 2560 |
| 3XL | 3200+ | 4K at 100%, ultrawide 3440 | 3440 / 3840 |

Extra queries, used alongside width:
- `(hover: hover) and (pointer: fine)` gates every hover style.
- `(pointer: coarse)` turns on 44 px hit areas and bottom sheets.
- `(max-height: 760px)` is the short-screen rule (1280 × 720, 1366 × 768).
- `(orientation: landscape) and (max-height: 500px)` is the landscape-phone rule.
- `(min-aspect-ratio: 21/9)` is the ultrawide rule.

## Tokens by tier

| Token | XS | S | M | L | XL (shipped) | XXL | 3XL |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Side gutter | 20 | 24 | 40 | 48 | clamp(20px,4.5vw,64px) | 96 | 128 |
| Header | 56, icons | 56, icons | 64, Menu/Search labels | 76, full nav | shipped | scaled | scaled |
| Root font-size | 100% | 100% | 100% | 100% | 100% | 112% | 125% |
| Page H1 | 40 | 44 | 56 | 64 | clamp(48px,6vw,84px) | 94 | 105 |
| Section H2 | 32 | 36 | 42 | 48 | clamp(34px,4vw,56px) | 63 | 70 |
| Long-form / lede | 19/1.6 · 21/1.5 | 19/1.6 · 22 | 20/1.62 · 23 | 21/1.62 · 25 | 21/1.62 · 25 | 23.5 · 28 | 26 · 31 |
| Mono labels | 10 min | 10 | 10.5 | 10.5 | 9.5–10.5 | ×1.12 | ×1.25 |
| Index max-width | fluid | fluid | fluid | fluid | 1240–1320 | 1600 | 1800 |
| Reading column | fluid | 560 | 640 | 680 | 680–760 | 840 | 920 |
| Card grid | 2 col, gap 16 | 3 col, gap 20 | 3 col, gap 24 | 4 col | auto-fill 210 | auto-fill 240 | auto-fill 260 |
| Section padding | 64 | 72 | 88 | 100 | clamp(80px,8vw,120px) | 140 | 160 |

**Implementation:** convert every type size, gutter, padding and max-width from px to rem once (px ÷ 16). XXL and 3XL then cost one line each (`html { font-size: 112% }` / `125%`). Hairlines, star sizes, the dial and borders stay in px. Use these values as the ends of `clamp()` ranges between tiers rather than hard jumps where it reads better; the tier values are the targets at each design width.

## Global rules
1. **Hover is a bonus.** On touch, the first tap on a star, card or legend item selects it (the state hover shows on desktop); links inside the selection navigate.
2. **Touch targets** are at least 44 × 44 under `(pointer: coarse)`. Stars keep their drawn size but get a 44 px hit area; where hit areas overlap, the nearest star centre wins.
3. **Viewport units.** Full-height sections use `min-height: max(100svh, 640px)`. Sheets and the menu use `dvh`. No bare `100vh`.
4. **Safe areas.** `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`. Header, menu, sheets and the dial pad with `env(safe-area-inset-*)`.
5. **No horizontal page scroll** at any size. Sideways scrolling is allowed only inside the rows listed below (legend, routes, chips, detail images, Narratives band, archive tab strip).
6. **Motion.** Ceremony runs in "short" mode below 768 px and with Save-Data. Background stars: count = canvas area ÷ 2800, DPR capped at 2, paused offscreen. `prefers-reduced-motion` still jumps to end states.
7. **Images.** `srcset` at 480, 800, 1200, 1800, 2600. `sizes` for cards: 50vw (XS), 33vw (S–M), 25vw (L), 320px above. Plates: `min(100vw, 980px)`. Lazy-load below the first viewport.
8. **Keyboard.** The "⌘K" label shows only under `(pointer: fine)`. ⌘K / Ctrl-K, dial arrows and Esc work at every size.

## Shell
- **Header.** ≥1024: shipped three-column header; at L, padding 0 48px, nav gap 22px, logo 14px in a 96 · 24 · 96 grid. 768–1023: Menu (icon + label) · logo · Search (label + icon), height 64. <768: two 44 px icon buttons and a 13px logo, height 56 + safe-area-inset-top.
- Below 1024 the header is sticky: transparent over heroes and skies; after 24px of scroll it gets `rgba(7,10,20,.86)`, a 14px backdrop blur and a hairline; it hides on scroll down and returns on scroll up (220ms).
- **Menu** (new surface, <1024): native `<dialog>`, 100dvh, fades in over 300ms. Six header routes in Gloock 30px on 60px rows (current page gold with the glowing dot, The Island in island gold), then "The Archive" and the other five archive pages in italic Garamond 18px on 44px rows, then the motto line at the bottom. Focus trapped, Esc and × close, page behind doesn't scroll.
- **Footer.** Same order. Motto italic 42 (XS) / 52 (M). Archive links: two-column grid of 48px rows on XS–S, three columns on M, shipped wrapping row from L.

## Pages
**Home.** XS–S: one centred column (epigraph, star, eyebrow, aperture `min(64vw,300px)`, name, date · origin, actions); maker, short description and "↺ Replay the opening" follow under the fold. The meridian line stops 16px under the aperture. M: aperture 340px, then the two shipped flanks under it on either side of the meridian line (gap 64, max 300 each). L: shipped hero with aperture `min(360px,30vw)`. Sky chart box: 4:5 (XS), 1:1 (S), 16:10 (M), 1320:600 (L+), same normalised positions; ticks 1700 · 1850 · 1900 · 1950 on XS. Tapping a star docks its card under the chart. Constellation names: one sideways row; the auto-cycle scrolls the active name into view. Narrative cards one column; threads stack left-aligned with a 48px horizontal gold rule between them.

**Timeline.** Pan mode whenever the sky box is narrower than 700px: sky drawn 2.6 × viewport wide and translated so x(year) sits on the meridian line; dragging the sky sideways scrubs the year with the dial's ppy and momentum (`touch-action: pan-y`); name tags on passing stars stack downward by the height of the tag above when they would overlap. XS: year block top-left (year `clamp(64px,19vw,84px)`), "▶ Wind" 44px button top-right, "Passing through · N" as a 48px bar that opens a sheet, dial 196px + safe area with the side mask on the outer 12%. Star tap on touch: bottom sheet (max 62dvh) with the card's content, 48px "Read the object →" button; close by handle drag, ×, tapping the sky or Esc. M: whole sky; year block and Passing list move under the header; dial full width (mask outer 10%), height 230. L: shipped layout, side panels `min(260px,24vw)`. Landscape phones: header hides while the sky is in view, whole sky, 120px dial. Below the sky: routes in one sideways row; shelves 2 / 3 / 3 / 4 columns (XS / S / M / L); tapping a card scrolls up and opens its sheet.

**Narrative.** Below L: title block first; then the stage becomes a full-bleed sticky band (`clamp(240px,36svh,340px)` on XS–S, 40svh on M) above the story; sticky top is 0 while the header is hidden, 56 when it shows. Same reveal logic, with the observer's trigger line at 62% of the viewport. Active star 88px (M: 120), earlier stars 56px (M: 76), names under them. A "2 / 3" counter top-right. Constellations of more than six objects scroll sideways in the band, active star centred. M story column 600px. L and landscape phones: shipped two columns at 1 : 1.

**Object.** XS–S: plate edge to edge; hotspots as numbered 28px rings; plate, rings and "Inspect" open a full-screen viewer (pinch / double-tap to 4×, pan, swipe down to close, hotspot sheet with ‹ ›, thumbnail strip). With a mouse, the shipped in-place zoom stays. Detail images: sideways row of 220px tiles with scroll-snap (three across from M). Title block centred, H1 `clamp(34px,10vw,44px)`. Record is a `<details>`: closed on XS–S, open as a two-column grid on M, shipped sticky aside (260px) from L. Copy citation 48px button; mailto links 44px rows. Reading progress: indicator star on a gold hairline pinned under the header.

**Collection.** "Arrange by" as a full-width segmented control (44px); "Show" as 44px chips in a sideways row. After the controls scroll away, a 44px sticky bar shows the current shelf and an "Arrange" button opening the controls in a sheet.

**Narratives.** The 1000px sky band scrolls sideways and sticks under the header at 250px. On touch, the card nearest the middle of the screen lights its path and the band scrolls to centre it; tapping a band star scrolls to its card. Cards 1 / 2 / shipped columns (XS / S / L).

**The Island.** Rows stack: year `clamp(52px,16vw,72px)` with its gold rule, image 4:3, meta, name, description, ring and link. The dashed gap moves to the left edge, height still scaled to the years and clamped to 48–200px. H1 `clamp(56px,17vw,80px)`.

**Search.** Input sticky under the header, Gloock `clamp(30px,9vw,40px)`, `type="search"`, `enterkeyhint="search"`, `autocapitalize="off"`. "Try" row directly under the input. Rows min 64px, whole row is the link. XS–S first page: Objects 5, other groups 3. The keyboard's Search key opens the active row; scrolling the results blurs the input.

**Archive pages.** Below L, the 220px rail becomes a sticky 48px tab strip under the header with the current page scrolled into view. L rail 200, XXL+ rail 240. Per page: About pull quote 28px with its rule above; Collecting Policy thread cards stack, test question `clamp(28px,8vw,40px)`; Verification label column becomes a label row above the text; Seeking number column 40px and 44px "I know of one" rows; Access rows stack and the citation box wraps with a full-width Copy button; Annual Review indent 28px.

## Large and odd screens
- XXL / 3XL: root font-size 112% / 125%; index max-width 1600 / 1800; reading column 840 / 920; card min track 240 / 260 (five per row at 2560).
- Ultrawide (`min-aspect-ratio: 21/9`) or ≥3200: Timeline sky, Narratives band and Home chart lay out in a box of max 2400px (× root scale) centred on the meridian, stars fading across its outer 8%. The year block and Passing list anchor to that box. Star sizes ×1.15 at 3XL. The background canvas still fills the screen.
- Short screens (`max-height: 760px`): Home hero floor 640 (was 820), aperture `min(400px,34vw,52svh)`; Timeline section min 640, dial 160; Narrative stage min-height 560.

## Test matrix
Screenshot every page at each viewport before a phase is approved. Use touch emulation for XS, S and M.
- XS: 320×568, 375×667, 390×844, 430×932
- S: 844×390, 932×430, 744×1133
- M: 820×1180, 834×1194
- L: 1024×1366, 1194×834, 1180×820
- XL (regression): 1280×720, 1366×768, 1440×900, 1920×1080, **2233×1307 must still match `screenshots-xl/`**
- XXL / 3XL: 2560×1440, 3440×1440, 3840×2160
