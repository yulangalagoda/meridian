# 08 · Prompt for the responsive pass

Paste this into a new Claude Code session on `yulangalagoda/meridian`. It assumes the Night Sky site from phases 0–10 is live on `main`.

```
The Meridian (meridian.yulan.me) is live but only works on desktop. This session makes it
work on every screen: phones, tablets, laptops, large monitors and ultrawides.

THE DESKTOP DESIGN DOES NOT CHANGE. Everything between 1280 and 2399 px wide must look exactly
as it does now. At 2233×1307 every page must still match design_handoff_meridian_night_sky/
screenshots-xl/. All work is additive.

Before writing any code:
0. Run `npm install`, then confirm `npm run build` works with NOTION_TOKEN.
1. Read CLAUDE.md (repo root), then design_handoff_meridian_night_sky/07-responsive.md.
2. Open design_handoff_meridian_night_sky/designs/Responsive System.dc.html in Playwright
   (it is a large pan-and-zoom board; give it a 6000×4000 viewport or scroll section by
   section). Screenshot each numbered section (00–09) and read the notes under every frame.
   Frames are drawn at true pixel size, so you can measure them. Where the doc and the
   board disagree, the board wins.
3. Summarise back to me, in 10 lines, how the phone, tablet and large-screen versions
   differ from desktop, so I know you have the right picture.

Hard rules:
- Work on a branch called `responsive`. Push at the end of every phase; Cloudflare Pages
  builds a preview for the branch. Send me the preview URL so I can check on my phone, then
  STOP and wait for "approved". Merge into main only after the last phase is approved.
- Never change copy. Never change colours, fonts or any value used at 1280–2399 px.
- No new visual language: every new surface (menu, bottom sheets, viewer, tab strip) uses
  the existing tokens exactly as drawn on the board.
- No horizontal page scroll at any size. Sideways scrolling only inside the rows the board
  marks as scrolling.
- prefers-reduced-motion still jumps to end states everywhere, including the new sheets.
- `node design_handoff_meridian_night_sky/guard-old-ui.mjs` must pass before every commit.

Done-check for every phase: screenshot every page touched at every viewport in the test
matrix in 07-responsive.md (touch emulation on for XS, S and M). Compare each with the
matching frame on the board, and the 2233×1307 shots with screenshots-xl/. List every
difference, fix, screenshot again. Report any page with horizontal overflow, text under
10px, or a tap target under 44px.

Phases:
R0. Audit only. Screenshot every route at the full test matrix as it is today and list
    what breaks at each size. No code changes.
R1. Foundations. viewport-fit=cover; breakpoint and query constants; convert type sizes,
    gutters, padding and max-widths from px to rem; root font-size 112% at ≥2400 and
    125% at ≥3200; wrap all hover styles in (hover:hover) and (pointer:fine); replace 100vh
    with svh/dvh; safe-area padding; the short-screen rule. Prove 2233×1307 is unchanged.
R2. Shell. Header in three modes, sticky and auto-hiding below 1024; the menu <dialog>;
    footer grid.
R3. Archive pages (tab strip and per-page treatments), Collection, The Island, Search.
R4. Object page: edge-to-edge plate, detail row, record <details>, full-screen viewer
    with pinch zoom and hotspot sheet, reading-progress hairline.
R5. Narratives index (scrolling, sticky band; centre card lights its path) and the
    Narrative page (sticky band above the story, trigger line at 62%).
R6. Home: stacked hero, tablet flanks, chart boxes, docked star card, legend row,
    stacked threads, short-screen hero.
R7. Timeline: pan mode below 700px of sky, sky drag scrubbing, bottom sheets for star
    and Passing through, tablet layout, landscape phones, ultrawide sky box.
R8. Large screens and performance: XXL/3XL checks, star-canvas density, srcset/sizes,
    lazy loading. Final run of the whole test matrix, plus a Lighthouse mobile run on
    /, /timeline and one object page; report the scores.
```
