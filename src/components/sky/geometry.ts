// The sky's geometry, ported from the references' scripts (Timeline prep(),
// Object glyph(), Narratives, Home). Every object is a star: x from its year on a
// piecewise scale, y from a hash of the first slug of its year; objects sharing a
// year spiral out around that point. Coordinates are 0–1 fractions of the sky.

export interface SkyItem {
  slug: string;
  year: number;
}

// Piecewise year → x scale.
const X: [number, number][] = [[1580, 0], [1820, 0.12], [1860, 0.27], [1900, 0.46], [1940, 0.73], [1985, 1]];
export function xr(y: number): number {
  for (let i = 1; i < X.length; i++) {
    if (y <= X[i][0]) {
      const a = X[i - 1], b = X[i];
      return a[1] + ((b[1] - a[1]) * (y - a[0])) / (b[0] - a[0]);
    }
  }
  return 1;
}

// FNV-1a, as a 0–1 fraction.
export function hash(s: string): number {
  let x = 2166136261;
  for (let i = 0; i < s.length; i++) {
    x ^= s.charCodeAt(i);
    x = Math.imul(x, 16777619);
  }
  return (x >>> 0) / 4294967296;
}

// Star positions for every item, in the order given (the references use the
// data order, i.e. Notion's Display Order, to group and spiral same-year items).
export function skyPositions(items: SkyItem[]): Record<string, [number, number]> {
  const groups: Record<number, SkyItem[]> = {};
  items.forEach((it) => (groups[it.year] = groups[it.year] || []).push(it));
  const pos: Record<string, [number, number]> = {};
  Object.keys(groups).forEach((y) => {
    const g = groups[+y], cx = 0.035 + xr(+y) * 0.93, cy = 0.14 + hash(g[0].slug + 'y') * 0.66;
    g.forEach((it, i) => {
      if (g.length === 1) { pos[it.slug] = [cx, cy]; return; }
      const ang = i * 2.39996 + 0.6, rad = 0.03 * Math.sqrt(i + 0.5);
      pos[it.slug] = [cx + Math.cos(ang) * rad * 0.45, cy + Math.sin(ang) * rad];
    });
  });
  return pos;
}

// A narrative's mini constellation in a 168×76 box (the Object reference's
// glyph()): its stars in year order, fitted and centred; the current object's
// star is 9px island gold, the others 5px.
export function glyph(pos: Record<string, [number, number]>, years: Record<string, number>, slugs: string[], me?: string) {
  const its = slugs.filter((s) => pos[s]).sort((a, b) => years[a] - years[b]);
  const pts = its.map((s) => [pos[s][0] * 1320, pos[s][1] * 600]);
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const minx = Math.min(...xs), miny = Math.min(...ys);
  const bw = Math.max(Math.max(...xs) - minx, 1), bh = Math.max(Math.max(...ys) - miny, 1);
  const sc = Math.min(152 / bw, 60 / bh, 3);
  const ox = (168 - bw * sc) / 2, oy = (76 - bh * sc) / 2;
  const gp = pts.map((p) => [ox + (p[0] - minx) * sc, oy + (p[1] - miny) * sc]);
  return {
    d: gp.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' '),
    dots: gp.map((p, i) => {
      const mine = its[i] === me;
      return { left: (p[0] / 1.68).toFixed(2) + '%', top: (p[1] / 0.76).toFixed(2) + '%', size: mine ? '9px' : '5px', color: mine ? '#F2CF85' : '#FFF6E2' };
    }),
  };
}

// A constellation line through points in order: quadratic curves bowed by a hash
// of the seed and segment, at most `cap` px (Timeline 64, Narratives 40).
export function curve(pts: [number, number][], seed: string, cap: number): string {
  let d = '';
  pts.forEach((p, i) => {
    if (!i) { d = 'M' + p[0].toFixed(1) + ' ' + p[1].toFixed(1); return; }
    const q = pts[i - 1], mx = (q[0] + p[0]) / 2, my = (q[1] + p[1]) / 2, dx = p[0] - q[0], dy = p[1] - q[1];
    const L = Math.hypot(dx, dy) || 1, o = (hash(seed + i) - 0.5) * Math.min(cap, L * 0.3);
    d += ' Q' + (mx - (dy / L) * o).toFixed(1) + ' ' + (my + (dx / L) * o).toFixed(1) + ' ' + p[0].toFixed(1) + ' ' + p[1].toFixed(1);
  });
  return d;
}

// The Narratives sky band (Narratives prep()): x straight from the year scale,
// y over 0.08–0.92, same-year objects spiralled a little wider.
export function bandPositions(items: SkyItem[]): Record<string, [number, number]> {
  const groups: Record<number, SkyItem[]> = {};
  items.forEach((it) => (groups[it.year] = groups[it.year] || []).push(it));
  const pos: Record<string, [number, number]> = {};
  Object.keys(groups).forEach((y) => {
    const a = groups[+y], cx = xr(+y), cy = 0.08 + hash(a[0].slug + 'y') * 0.84;
    a.forEach((it, i) => {
      const ang = i * 2.39996 + 0.6, r = a.length > 1 ? 0.035 * Math.sqrt(i + 0.5) : 0;
      pos[it.slug] = [cx + Math.cos(ang) * r * 0.4, cy + Math.sin(ang) * r];
    });
  });
  return pos;
}

// The narrative page's raw star points (Narrative points()): x straight from the
// year scale, y the bare hash, same-year objects spiralled as in the Timeline.
export function storyPoints(items: SkyItem[], slugs: string[]): [number, number][] {
  const groups: Record<number, SkyItem[]> = {};
  items.forEach((it) => (groups[it.year] = groups[it.year] || []).push(it));
  return slugs.map((s) => {
    const it = items.find((x) => x.slug === s)!, g = groups[it.year], i = g.indexOf(it), cx = xr(it.year), cy = hash(g[0].slug + 'y');
    if (g.length === 1) return [cx, cy] as [number, number];
    const ang = i * 2.39996 + 0.6, rad = 0.03 * Math.sqrt(i + 0.5);
    return [cx + Math.cos(ang) * rad * 0.45, cy + Math.sin(ang) * rad] as [number, number];
  });
}
