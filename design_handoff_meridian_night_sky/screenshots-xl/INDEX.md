# Reference screenshots: large screen (primary)

Captured from a **2233 × 1307 viewport**. Pages that scroll render at 2218 px wide, because the scrollbar takes 15 px. Unless a name says otherwise, each image is the **whole page** from top to bottom, with every scroll reveal already triggered. Frames named `*-top`, `*-sky-*`, `*-star-card` or `*-ceremony-*` show only the first screen.

These are the main target. `../screenshots/` has the same pages at 909 × 540, to check the narrow layout.

## How to compare
- Run Playwright with `viewport: { width: 2233, height: 1307 }`. For full pages, use `page.screenshot({ fullPage: true })` after scrolling to the bottom once, so every reveal fires.
- Also render the reference `.dc.html` itself (`npx serve design_handoff_meridian_night_sky/designs`) at the same size, and compare it with the build side by side.

## Notes
- Dashed boxes with "browse files" are photo placeholders. Put the object's Notion image there.
- The camera photo on Home is a test drop and doesn't match the object named next to it.
- In the full-page narrative shot, the constellation panel shows at the top only. In the live page it is **sticky**: it stays pinned while the story scrolls (see `narrative-1927-3`).
- If the right-hand header nav wraps in any capture, that's a capture artefact. On the live page it is one line.

## Files
| File | Route | State |
| --- | --- | --- |
| home-1-ceremony-start | `/` | about 1 s after load |
| home-2-ceremony-end | `/` | featured object risen to the meridian |
| home-3-full | `/` | whole page |
| collection-1-by-field | `/collection` | Arrange by Field, Show All |
| collection-2-by-era | `/collection` | Arrange by Era |
| collection-3-era-island-only | `/collection` | Era + Show: The Island |
| object-taprobana-0-top / -1-full | `/collection/[slug]` | first screen / whole page |
| narratives-1 | `/narratives` | whole page |
| narratives-2-hover-card | `/narratives` | card 02 hovered: its constellation lit, the others dimmed |
| narrative-1927-1-top | `/narratives/[slug]` | first screen |
| narrative-1927-2-full-revealed | `/narratives/[slug]` | whole page, all paragraphs revealed |
| narrative-1927-3-pinned-panel-mid-story | `/narratives/[slug]` | sticky panel mid-story, stars opened |
| timeline-1-sky-1927 | `/timeline` | default year 1927 |
| timeline-2-star-card | `/timeline` | Taprobana star clicked |
| timeline-3-sky-1877 | `/timeline` | after Shift+← ×5 |
| timeline-4-full-with-shelves-1877 | `/timeline` | whole page: sky, routes, era shelves |
| timeline-5-route-selected-full | `/timeline` | route "Picturing Place" selected: its cases lit |
| the-island | `/the-island` | whole page |
| search-1-empty / -2-results-ceylon / -3-no-results | `/search` | three states |
| archive-about, -collecting-policy, -verification, -seeking, -access, -annual-review | archive routes | whole page |
