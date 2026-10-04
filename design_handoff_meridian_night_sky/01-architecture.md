# 01 · Architecture

## Routes (Astro `src/pages/`)
| Route | Design file | Data |
| --- | --- | --- |
| `/` | Home - Night Sky | items (featured), narratives |
| `/collection` | Collection | items, categories |
| `/collection/[slug]` | Object - Taprobana (template) | item + `fetchItemContent(id)` |
| `/narratives` | Narratives | narratives, items |
| `/narratives/[slug]` | Narrative - The Year 1927 (template) | narrative + its body (new fetch) |
| `/timeline` | Timeline - The Sky Over Time | items, narratives |
| `/the-island` | The Island | items in The Island thread |
| `/search` + ⌘K palette | Search | `search-index.json` (already exists) |
| `/about` | Archive - About | `aboutHtml` |
| `/collecting-policy`, `/verification-and-provenance`, `/seeking`, `/access-citation-image-use`, `/annual-review` | Archive - … | `fetchPolicyContent(slug)` |

Keep `redirects.json` as it is. Item URLs stay `/collection/[slug]`.

## Data flow
Everything is static. `getSiteData()` runs once per build, and each interactive page gets its data serialised as JSON props on an Astro island. Nothing calls Notion at runtime. Interactive parts (the timeline dial, the star popovers, the home ceremony, the narrative constellation, search, the collection filters and the narratives sky) should be small client islands in vanilla TS or Preact, loaded with `client:visible`. The rest of each page renders on the server.

## Notion gaps to close before building (Claude Code does these in Phase 0)
1. **Thread flag.** The designs mark objects in The Island thread (shown with gold names). Notion has no such field yet. Add a `Thread` select (The Island / Instruments of Progress) to Items.
2. **Narrative body.** The narrative page shows an opening, a pull quote, a close and one paragraph per object. Add `fetchNarrativeContent(pageId)`, mirroring `fetchItemContent`, and decide how paragraphs map to objects (for example, one H3 per object, titled with the object's name).
3. **Detail hotspots.** The object page has a zoomable detail map with hand-placed points. Add an optional `Details` property (JSON: `[{x, y, label, text}]`, with x and y as 0–1 fractions), or leave the feature out for objects without it.
4. **Date range.** The timeline's "passing through" logic parses `Date Detail` strings such as "c.1875–1895" and "1854–55" into a year range. Move that parser into `src/lib`, or add `Year From` / `Year To` number fields.
5. **Data issues:** the Agfa purchase price is already removed from Provenance. "Nature's Arts and Crafts" (school prize July **1937** vs **1927** in the narrative) is on hold for the collector to check; don't change it.

## Search
`search-index.json.ts` already produces `{objects, narratives, fields, pages}`. The Search page uses those four groups. Keep it all client-side: fetch the JSON once and match tokens across `t + k + d + m`. Rank title-prefix matches first, then title matches, then everything else.
