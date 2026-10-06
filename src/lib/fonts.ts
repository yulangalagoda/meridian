// The Google Fonts stylesheet for Gloock, EB Garamond and IBM Plex Mono, fetched
// once at build time and inlined in every page's <head>. The browser then asks
// fonts.gstatic.com for the font files straight away instead of first waiting
// on a render-blocking stylesheet from a second origin. Same files, same
// @font-face rules. If the fetch fails, pages fall back to the <link>.
export const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Gloock&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=IBM+Plex+Mono:wght@400;500&display=swap';

// Google serves woff2 with unicode-range subsets to any current browser.
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

const get = (url: string) =>
  fetch(url, { headers: { 'User-Agent': UA } })
    .then((r) => (r.ok ? r.text() : null))
    .then((css) => (css && css.includes('@font-face') ? css.replace(/\/\*[^*]*\*\//g, '').replace(/\s+/g, ' ').trim() : null))
    .catch(() => null);

let faces: Promise<string | null> | null = null;

export function fontFaces(): Promise<string | null> {
  faces ??= get(FONTS_URL);
  return faces;
}

// The Latin files (unicode-range from U+0000-00FF) that first screens use, to
// preload so text arrives in its own face rather than swapping in after first
// paint. IBM Plex Mono 400 only sets the citation boxes, further down, so it
// loads when needed.
export const latinFonts = (css: string) =>
  [...css.matchAll(/@font-face \{([^}]*)\}/g)]
    .map((m) => m[1])
    .filter((f) => /unicode-range: U\+0000-00FF/.test(f) && !(/IBM Plex Mono/.test(f) && /font-weight: 400/.test(f)))
    .map((f) => /src: url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/.exec(f)?.[1])
    .filter((u, i, a): u is string => !!u && a.indexOf(u) === i);
