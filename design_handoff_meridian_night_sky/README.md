# Handoff: The Meridian — Night Sky site

## Overview
A full redesign of meridian.yulan.me (repo `yulangalagoda/meridian`, Astro 4 + `@notionhq/client`, static build on Cloudflare Pages). Every object is a star placed by its year, and narratives are drawn as constellations. The handoff covers 16 screens: home, collection, object, narratives, narrative, timeline, The Island, search, and six archive pages.

## About the design files
The `.dc.html` files in `designs/` are **design references built in HTML**. They show the intended look and behaviour; they are not production code to paste in. **This is a complete UI overhaul.** Reuse only the data layer (`src/lib/*`). Every component, layout, stylesheet and page template in the current repo is deleted and rebuilt from these references. Nothing visual carries over.

To view a reference, open it in a browser from this folder. Each file loads `support.js`, `meridian-data.js` and `image-slot.js`, which sit next to the designs.

## Fidelity
**High fidelity.** Colours, type, spacing, copy and motion are final. Recreate them pixel-for-pixel. The new Night Sky tokens replace the old paper/ink/oxblood palette in `src/styles/global.css`.

## Read in this order
1. `01-architecture.md`: routes, the Notion data each page needs, and the schema gaps to close
2. `02-design-tokens.md`: colours, type, spacing, borders and shadows
3. `03-screens.md`: layout and components for each screen
4. `04-motion-and-interaction.md`: every animation, interaction and state
5. `05-cloud-session-setup.md`: one-time cloud session setup
6. `06-claude-code-prompt.md`: the prompt to paste
7. `screenshots-xl/INDEX.md`: full-page large-screen references (the main target); `screenshots/` has the 909 px layout

## Files
See `designs/`. The data shape the designs read is in `designs/meridian-data.js`; it mirrors the `Item` and `Narrative` types in `src/lib/types.ts`.
