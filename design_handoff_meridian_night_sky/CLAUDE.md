# The Meridian: Night Sky rebuild rules (copy this file to the repo root)

## This is a complete UI overhaul
The old UI (paper/ink/oxblood palette, Libre Caslon Display, masthead/colophon/rail layout) is being **deleted, not adapted**. The new site must look exactly like the references in `design_handoff_meridian_night_sky/designs/` and `screenshots/`. When the old code and a reference disagree, the reference wins. Every time.

## Never
- Reuse, restyle or "evolve" any old component, layout, class name or CSS variable: `Header`, `Footer`, `ItemCard`, `FilterBar`, `MeridianArc`, `CategoryIcon`, `Search.astro`, `Base.astro`, or anything in the old `global.css`.
- Use any old colour (`#F4EFE6 #ECE5D6 #E4DBC9 #C9BCA4 #1A130B #3A2E20 #5A4836 #776349 #7A2E22 #8E3A2C #3F6B32 #7A5C18 #17110A #211910 #CD8268`) or the font Libre Caslon Display.
- Add a light theme or theme toggle, or keep any old dark mode. The site is Night Sky only.
- Invent, rewrite or shorten copy. All public text comes from Notion, word for word.
- "Simplify" an interaction (dial, glide, star card, ceremony, constellation draw-in) or swap it for a static version.

## Always
- Translate each reference element by element. Copy its values exactly: hex, rgba, font shorthand, clamp(), letter-spacing, gaps, transitions. Inline styles may move into scoped `<style>` blocks only if the values stay identical.
- Port the logic in each reference's `<script data-dc-script>` block into a client island, keeping the same maths and timings.
- Use only Gloock, EB Garamond and IBM Plex Mono. The background is `#070A14`.
- Keep the data layer: `src/lib/*`, `src/pages/search-index.json.ts`, `functions/`, `public/.well-known/`, `astro.config.mjs`, `scripts/`. `richtext.ts` may change the markup it emits so the new styles apply.
- Run `node design_handoff_meridian_night_sky/guard-old-ui.mjs` before every commit. It must pass.
- Before calling a page done, compare it with `screenshots-xl/` at 2233×1307 (the primary target) and `screenshots/` at 909×540, and with the reference `.dc.html` rendered in Playwright at the same sizes. List every difference you can see, then fix them.
