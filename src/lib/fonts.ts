// The Google Fonts stylesheet for Gloock, EB Garamond and IBM Plex Mono, fetched
// once at build time and inlined in every page's <head>. The browser then asks
// fonts.gstatic.com for the font files straight away instead of first waiting
// on a render-blocking stylesheet from a second origin. Same files, same
// @font-face rules. If the fetch fails, pages fall back to the <link>.
export const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Gloock&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=IBM+Plex+Mono:wght@400;500&display=swap';

// Google serves woff2 with unicode-range subsets to any current browser.
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

let faces: Promise<string | null> | null = null;

// The Latin subsets' files (unicode-range from U+0000-00FF), which every page's
// first screen needs: preloading them lets the text arrive in its own face
// rather than swapping in after first paint.
export const latinFonts = (css: string) =>
  [...css.matchAll(/src: url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)[^}]*unicode-range: U\+0000-00FF/g)].map((m) => m[1]).filter((u, i, a) => a.indexOf(u) === i);

export function fontFaces(): Promise<string | null> {
  faces ??= fetch(FONTS_URL, { headers: { 'User-Agent': UA } })
    .then((r) => (r.ok ? r.text() : null))
    .then((css) => (css && css.includes('@font-face') ? css.replace(/\/\*[^*]*\*\//g, '').replace(/\s+/g, ' ').trim() : null))
    .catch(() => null);
  return faces;
}
