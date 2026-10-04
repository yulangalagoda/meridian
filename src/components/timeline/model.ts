// The timeline's state, ported from the Timeline reference's script (prep() and
// renderVals()). view() turns a year, a picked star and a chosen route into what
// the page shows; the server renders it for the start year and the client
// re-renders it on every frame of a drag, glide or play.
import { hash } from '../sky/geometry';

export const Y0 = 1590;
export const Y1 = 1979;
export const DEG = 0.8; // degrees of dial per year
export const R = 1100; // dial radius in px
export const START = 1927;

export const ERAS: [string, number, number][] = [
  ['Renaissance', 1590, 1602], ['Stuart', 1603, 1713], ['Georgian', 1714, 1836], ['Victorian', 1837, 1900],
  ['Edwardian', 1901, 1917], ['Interwar', 1918, 1938], ['Mid-Century', 1939, 1969], ['Late 20th C.', 1970, 1979],
];

export interface TLItem {
  slug: string;
  name: string;
  year: number;
  rng: [number, number]; // Year From – Year To, always including Year
  date: string;
  origin: string;
  short: string;
  island: boolean;
  verified: boolean;
  verification: string;
  featured: boolean;
  narratives: string[]; // narrative slugs
  pos: [number, number]; // 0–1 in the sky
}

export interface TLNarrative {
  slug: string;
  name: string;
  items: string[]; // item slugs
  d: string; // constellation path in the 1320×600 sky
  last: number; // year its last object rises
}

export interface TLData {
  items: TLItem[]; // Notion Display Order
  sorted: string[]; // slugs by year, then Display Order
  narratives: TLNarrative[];
}

// The constellation line: quadratic curves between the stars in year order,
// each bowed by a hash of the narrative and segment.
export function constellationPath(slug: string, pts: [number, number][]): string {
  let d = '';
  pts.forEach((p, i) => {
    if (!i) { d = 'M' + p[0].toFixed(1) + ' ' + p[1].toFixed(1); return; }
    const q = pts[i - 1], mx = (q[0] + p[0]) / 2, my = (q[1] + p[1]) / 2, dx = p[0] - q[0], dy = p[1] - q[1];
    const L = Math.hypot(dx, dy) || 1, o = (hash(slug + i) - 0.5) * Math.min(64, L * 0.3);
    d += ' Q' + (mx - (dy / L) * o).toFixed(1) + ' ' + (my + (dx / L) * o).toFixed(1) + ' ' + p[0].toFixed(1) + ' ' + p[1].toFixed(1);
  });
  return d;
}

export const clamp = (y: number) => Math.max(Y0, Math.min(Y1, y));

export function view(D: TLData, Y: number, pick: string | null, route: string | null, labels = true) {
  const Yr = Math.round(Y);
  const bySlug = new Map(D.items.map((it) => [it.slug, it]));
  const sorted = D.sorted.map((s) => bySlug.get(s)!);
  const era = ERAS.find((e) => Yr >= e[1] && Yr <= e[2]);
  const pass = sorted.filter((it) => it.rng[0] <= Yr && Yr <= it.rng[1]);
  const passSet = new Set(pass.map((i) => i.slug));
  const tagSet = new Set(pass.slice(0, 4).map((i) => i.slug));
  const pk = pick ? bySlug.get(pick) ?? null : null;
  const rn = route ? D.narratives.find((n) => n.slug === route) : null;
  const rt = rn ? new Set(rn.items) : null;
  const risen = D.items.filter((it) => it.year <= Y).length;

  const stars = D.items.map((it) => {
    const up = it.year <= Y, on = passSet.has(it.slug);
    return {
      op: up || on ? 1 : 0,
      scale: on ? 1.8 : up ? 1 : 0.3,
      glow: on ? '0 0 14px 5px rgba(255,240,205,.8),0 0 34px 12px rgba(211,179,112,.35)' : '0 0 6px 1.5px rgba(255,240,205,.32)',
      tag: labels && tagSet.has(it.slug) && !pk,
      pe: up || on ? 'auto' : 'none',
      ring: pk && pk.slug === it.slug ? 'inset 0 0 0 1px #D3B370' : rt && rt.has(it.slug) ? 'inset 0 0 0 1px rgba(211,179,112,.55)' : 'inset 0 0 0 1px rgba(211,179,112,0)',
    };
  });

  const formed = new Set(D.narratives.filter((p) => p.last <= Y).map((p) => p.slug));
  const focus = pk ? new Set(pk.narratives) : route ? new Set([route]) : null;
  const paths = D.narratives.map((p) => ({
    op: formed.has(p.slug) ? (focus ? (focus.has(p.slug) ? 1 : 0.2) : 0.9) : route === p.slug ? 0.5 : 0,
  }));

  const sel = pk && (pk.year <= Y || passSet.has(pk.slug)) ? pk : null;
  const n = pass.length;
  return {
    yearText: String(Yr),
    era: era ? era[0] : '',
    wheelRot: (-(Y - Y0) * DEG).toFixed(3) + 'deg',
    skyZ: pick ? 25 : 2,
    risenText: risen + ' of ' + D.items.length + ' objects have risen',
    passTitle: n ? 'Passing through ' + Yr : 'Nothing passes through ' + Yr,
    passing: pass.slice(0, 4).map((it) => ({ slug: it.slug, name: it.name, date: it.date })),
    passMore: n > 4 ? 'and ' + (n - 4) + ' more' : n === 0 ? 'Wind on to the next star.' : '',
    stars,
    paths,
    formed,
    sel,
    selNames: sel ? sel.narratives.map((s) => D.narratives.find((x) => x.slug === s)?.name ?? '').filter(Boolean) : [],
    routeOn: D.narratives.map((x) => route === x.slug),
    lit: Object.fromEntries(D.items.map((it) => [it.slug, rt ? (rt.has(it.slug) ? 1 : 0.06) : passSet.has(it.slug) ? 1 : it.year <= Y ? 0.32 : 0.12])),
  };
}
