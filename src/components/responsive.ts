// The responsive system's breakpoints and queries (07-responsive.md, the Responsive System
// board), for scripts. CSS writes the same numbers in its media queries; see NightSky.astro.
// XL (1280–2399) is the shipped design and must not change.
export const BP = { s: 480, m: 768, l: 1024, xl: 1280, xxl: 2400, xxxl: 3200 } as const;

export const MQ = {
  xs: '(max-width: 479px)',
  belowM: '(max-width: 767px)',
  belowL: '(max-width: 1023px)',
  belowXL: '(max-width: 1279px)',
  xxl: '(min-width: 2400px)',
  xxxl: '(min-width: 3200px)',
  fine: '(hover: hover) and (pointer: fine)', // gates every hover style
  coarse: '(pointer: coarse)', // 44px hit areas and bottom sheets
  short: '(max-height: 760px)', // 1280×720, 1366×768
  landscapePhone: '(orientation: landscape) and (max-height: 500px)',
  ultrawide: '(min-aspect-ratio: 21/9)',
  reduced: '(prefers-reduced-motion: reduce)',
  // The narrative's sticky band: below L, except on landscape phones.
  narrativeBand: '(max-width: 1023px) and (orientation: portrait), (max-width: 1023px) and (min-height: 501px)',
} as const;

export const matches = (q: string) => typeof window !== 'undefined' && !!window.matchMedia && matchMedia(q).matches;
