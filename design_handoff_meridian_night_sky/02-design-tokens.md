# 02 · Design tokens

## Colour
| Token | Hex | Use |
| --- | --- | --- |
| night-0 | `#070A14` | page background |
| night-1 | `#0B1124` | cards, panels, image wells |
| night-2 | `#141C38` | radial glow at the top of heroes |
| night-3 | `#111834` | footer glow |
| ink-hi | `#F3ECDC` | headings |
| ink | `#EEE7D7` | body on dark |
| ink-soft | `#D9D2C3` | long-form paragraphs |
| ink-mid | `#B8B2A5` | secondary text, nav |
| ink-low | `#8D897F` | meta, captions |
| gold | `#D3B370` | rules, links, eyebrows, active nav |
| gold-hi | `#F2D493` | inline links, highlights, years |
| island | `#F2CF85` | names of objects in The Island thread |
| star | `#F6F0E2` / `#FFF8E8` | star cores |
| gold-pill | `linear-gradient(135deg,#A8834D,#E6CC92 45%,#A07B45)` on text `#141008` | shelf labels |

Hairlines are `rgba(238,231,215,.08–.12)`; gold rules are `rgba(211,179,112,.22–.6)`. Hero backgrounds use `radial-gradient(ellipse 70% 40% at 50% 0%, #141C38, #0B1124 45%, #070A14)`.

## Type (Google Fonts)
- **Gloock 400**: display, titles and object names. H1 is `clamp(48px,6vw,84px)/1`; section H2 is `clamp(34px,4vw,56px)/1.06`; card titles are 19px/1.2; the logo is 15px with letter-spacing .42em.
- **EB Garamond 400 / italic**: body. Long-form is 21px/1.62, ledes are 25px/1.5, secondary text is 18px/1.55, and route links are italic 18px.
- **IBM Plex Mono 500**: labels. 9.5–10.5px, uppercase, letter-spacing .14–.24em.
- Use `text-wrap: pretty` on paragraphs and `balance` on titles.

## Spacing and layout
- Side gutters: `clamp(20px,4.5vw,64px)`. Content max-widths: 1240–1320px for indexes, 680–760px for reading columns, 1080px for The Island.
- Section padding: `clamp(80px,8vw,120px)` vertically. Shelf gap: `clamp(56px,6vw,84px)`. Card grid: `repeat(auto-fill,minmax(min(100%,210px),1fr))` with a gap of `clamp(18px,2.2vw,30px)`.
- Corners are square everywhere except stars and rings (`50%`).

## Marks
- **Verification ring**: a 9–11px circle with a 1px border in `#D3B370`, solid for Verified and dashed for Research Ongoing. On Seeking, a dashed ring means an object the archive doesn't yet hold.
- **Star**: 4–7px with `box-shadow: 0 0 6px 1.5px rgba(255,240,205,.32)`. A lit star scales to 1.8× with `0 0 14px 5px rgba(255,240,205,.8), 0 0 34px 12px rgba(211,179,112,.35)`.
- **Card glow** (`--lit` runs 0–1): border `rgba(238,231,215,.08 + lit*.3)`, top bar `rgba(242,212,147,lit*.85)`, image `brightness(.4 + lit*.6)`, all with 0.8s transitions.

## Motto block (every footer)
A 6px star, then "Vayadhammā saṅkhārā" in italic Garamond `clamp(32px,4vw,52px)`, then "All conditioned things are subject to decay." in gold mono.
