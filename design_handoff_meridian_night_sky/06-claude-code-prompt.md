# 06 · Prompt to paste into the cloud session

```
This is a COMPLETE UI OVERHAUL of The Meridian. The current site's look is being thrown away:
its colours, fonts, layouts, components and CSS. Do not adapt, restyle or "evolve" it.
The only target is the Night Sky design in design_handoff_meridian_night_sky/.

Before writing any code:
0. Run `npm ci` (fall back to `npm install` if it fails). Then confirm `npm run build` works
   with NOTION_TOKEN before you change anything.
1. Read CLAUDE.md (repo root). It holds the hard rules and the banned list.
2. Read the handoff README.md and docs 01–04.
3. Open every image in design_handoff_meridian_night_sky/screenshots-xl/ (see its INDEX.md).
   That is what the finished site must look like (screenshots/ has the narrow layout). Then
   summarise back to me, in 10 lines,
   what the new site looks like, so I know you have the right picture.

Hard rules:
- KEEP only the data layer: src/lib/*, src/pages/search-index.json.ts, src/env.d.ts,
  functions/, public/ (except anything visual you replace), astro.config.mjs, package.json.
- DELETE and rewrite from the references: src/components/*, src/layouts/*, src/styles/*,
  and every .astro page. Don't open the old files for reference after deleting them.
- Every colour, font, size, spacing value, transition and piece of copy comes from the
  reference .dc.html files (inline styles) or 02-design-tokens.md. Nothing from the old CSS.
- Copy comes from Notion, word for word. Never invent or rewrite text.
- Interactions are ported exactly from each reference's <script data-dc-script> block.
- `node design_handoff_meridian_night_sky/guard-old-ui.mjs` must pass before every commit.
- Commit and push at the end of every phase, then STOP and wait for me to say "approved".

Done-check for every page: build it and take a full-page Playwright screenshot at 2233×1307.
Compare it with the matching image in screenshots-xl/ (the primary target), and at 909×540 with
screenshots/. Also render the reference .dc.html at the same size and compare side by side.
List every difference you can see (colour, font, spacing, alignment, missing element), fix them,
then screenshot again. If Playwright can't run, tell me. Don't skip the check.

Phases:
0. Notion prep. Show me each change as a table and wait for my OK before writing.
   a. Items: add a "Thread" select (The Island / Instruments of Progress). Set The Island on
      Descrittione dell'Isola Taprobana, Sacred Bo Tree, Thuparama Dagoba and The View from
      Serendip. Propose a thread for every other item.
   b. Items: add "Year From" / "Year To" numbers. Fill them by parsing Date Detail
      ("c.1875–1895", "1854–55", "1930s"…), and show me the parsed table first.
   c. Items: add an optional "Details" text property (JSON [{x,y,label,text}], x and y 0–1).
      Fill it for Taprobana from designs/Object - Taprobana.dc.html only.
   d. Narratives: where a narrative page has body text, structure it as an opening, one H3 per
      object (the object's exact name) and a close. Only move existing text, never write new
      text. List any narrative with no body text.
   e. Update src/lib/types.ts and notion.ts to read these fields, and add fetchNarrativeContent().
   Leave alone: the Agfa provenance (already fixed) and the 1927/1937 date (I'll check it later).
1. Demolition. Delete the old UI (see Hard rules). Add a bare Base layout with only the
   Night Sky body reset (#070A14 background, the three fonts). The build must pass, even if
   the pages are blank. Show me `git diff --stat`. /categories/* becomes a redirect to /collection.
2. Shell: Header, Footer (motto), VerificationRing, Star, the gold shelf label, and the shared
   card. Compare them with the archive-page screenshots.
3. Archive pages: /about, /collecting-policy, /verification-and-provenance, /seeking,
   /access-citation-image-use, /annual-review.
4. /collection and /the-island.
5. /collection/[slug] (reference: Object - Taprobana).
6. /timeline (dial, glide, momentum, play, clickable stars + card, era shelves, routes).
7. /narratives and /narratives/[slug] (reference: Narrative - The Year 1927).
8. Home ceremony.
9. /search, with ⌘K / Ctrl-K on every page going to /search. Don't add an overlay palette;
   none is designed.
10. Final pass: prefers-reduced-motion, keyboard focus, alt text from Image Alt Text,
    OG meta, 404 page in the Night Sky style, guard script, production build.
```
