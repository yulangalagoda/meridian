# Reference screenshots

Every frame was captured at a **909 × 540 viewport** (CSS px, device pixel ratio 1). Frame `NN` is at `scrollY = (NN − 1) × 500` unless noted otherwise. Use these as the target the build has to match.

## How to compare
1. Screenshot the built page with Playwright at 909 × 540, at the same scroll offsets, and compare it with these frames.
2. Desktop: render the reference itself at 1440 × 900 and screenshot the build at the same size. Run `npx serve design_handoff_meridian_night_sky/designs`, then open each `.dc.html` in Playwright. The references are live, so this works at any size.

## Notes
- Dashed boxes with "browse files" are photo placeholders. In production, put the object's Notion image there.
- The photo on Home is a test image and doesn't match the object named next to it.
- Object - Taprobana is the template for every object page, and Narrative - The Year 1927 is the template for every narrative page.
- At 909 px the header nav wraps onto two lines. That is intended.

## Frames
| Folder | Route | Frames |
| --- | --- | --- |
| home | `/` | 01 at 1.2 s, 02 at 4 s, 03 when the ceremony ends · 04–11 at scrollY 540, 1040 … 4040 · 12 bottom |
| collection | `/collection` | 01–05 by Field · 06 bottom · 07 Arrange by Era · 08 Era + Show: The Island |
| object-taprobana | `/collection/[slug]` | 01–14 scroll · 15 bottom |
| narratives | `/narratives` | 01 top · 02 scrollY 330 · 03 hovering card 02 (constellation lit) · 04–08 scrollY 830 + 500n |
| narrative-1927 | `/narratives/[slug]` | 01–09 scroll; stars open as paragraphs arrive |
| timeline | `/timeline` | 01 sky at 1927 · 02 star card (Taprobana) · 03 after Shift+← ×5 (1877) · 04–06 shelves at scrollY 560, 1060, 1560 · 07–08 first narrative route selected |
| the-island | `/the-island` | 01–06 |
| search | `/search` | 01 empty · 02 "Ceylon" · 03–05 scrolled · 06 no results |
| archive-about | `/about` | 01–04 |
| archive-collecting-policy | `/collecting-policy` | 01–04 |
| archive-verification | `/verification-and-provenance` | 01–05 |
| archive-seeking | `/seeking` | 01–05 |
| archive-access | `/access-citation-image-use` | 01–05 |
| archive-annual-review | `/annual-review` | 01–03 |
