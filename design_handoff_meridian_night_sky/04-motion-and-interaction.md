# 04 · Motion & interaction

Every motion must respect `prefers-reduced-motion`: jump straight to the end state with no tweening. The timeline logic is in the `<script data-dc-script>` block of `Timeline - The Sky Over Time.dc.html`. Port it into a TS island.

## Timeline dial
- Scale: 0.8° per year on a 1100px radius, covering 1590–1979. `wheel rotate = -(Y - 1590) * 0.8deg`. Ticks every year; tall ticks every 10 years, labelled in mono 10px; the tallest every 50.
- Dragging: pointer capture, Δx converted to years via `ppy = R * 0.8 * π/180`. On release, apply momentum (`v * 260 / ppy`), round to a whole year, and glide there.
- Glide: an ease-out cubic lasting `min(1600, 500 + |Δ|*6)` ms.
- Keys: ← and → move one year, Shift moves ten. They only work while the sky is in view. Esc closes the star card.
- "▶ Wind the centuries": plays at 42 yr/s, slowing to 6 yr/s within ±3 years of any object.
- Stars: risen once `year <= Y`; "passing through" while `Y` is inside the object's date range (parsed from Date Detail). Passing stars scale to 1.8× and glow.
- Constellations: draw in once their last object has risen, with a one-off flash keyframe (`opacity 0 → 1`, `stroke-width 3 → 1`, 1600 ms, ease-out).
- Star card: placed beside the star (left side when x > 62%), with its vertical position clamped between the header and the dial. It sits at z-index above the header.

## Cards (Timeline, Collection)
`--lit` is 1 for objects passing the current year or on the selected narrative, 0.32 for risen ones, and 0.06–0.12 otherwise. All glow properties transition over 0.8 s. Clicking a narrative toggles it as the active route.

## Home ceremony
The epigraph comes first, then the featured object rises to the meridian. The sequence is in `Home - Night Sky.dc.html` (`componentDidMount`). Keep its timings and easings.

## Narrative page
The constellation stays sticky on the left. An IntersectionObserver on each paragraph marks the active object: its star grows into a circular image, the path segment to it draws in via `stroke-dashoffset`, and earlier stars stay open.

## Object page
Clicking the plate zooms in (transform scale, 0.5 s, `cubic-bezier(.16,1,.3,1)`) with hotspots. The indicator star follows reading progress. "Copy citation" writes `Object name, The Meridian, collection of Yulan Galagoda, meridian.yulan.me/collection/[slug]` to the clipboard and shows "Copied".

## Narratives index
Hover or focus on a card highlights its path (gold `.95`, 1.6px), dims the other paths to `.07` and the other stars to 0.3, and changes the sky caption to the narrative's name. 0.5 s transitions.

## Search
Search runs as you type. ↑ and ↓ move the active row, Enter opens it, Esc clears the box, and ⌘K / Ctrl-K focuses and selects the input from anywhere. `?q=` pre-fills the query. Hovering a row makes it active.

## Hover states
Nav links and inline links turn gold (`#D3B370`). Cards get a border of `rgba(211,179,112,.6)`. Route links turn `#F2D493`. Buttons get a gold border.
