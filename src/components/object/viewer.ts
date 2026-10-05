// The full-screen image viewer on touch (Responsive System board, 5b): a
// <dialog> over #05070F. Pinch or double-tap up to 4×, one-finger pan, swipe
// down at 1× to close. Hotspots ride the image at a constant size; tapping one
// glides to it (0.5 s, cubic-bezier(.16,1,.3,1)) and fills the sheet with its
// label and text, ‹ › step between them. The thumbnails switch between the
// primary and the detail images. Reduced motion jumps instead of gliding.
import { MQ } from '../responsive';

export type Hot = { x: number; y: number; label: string; text: string };
export type Shot = { src: string; alt: string; name: string };

const GLIDE = 'transform .5s cubic-bezier(.16,1,.3,1)';
const MAX = 4;
const HOT_SCALE = 2.4;

export function initViewer(d: HTMLDialogElement, shots: Shot[], hots: Hot[]) {
  const $ = <T extends HTMLElement>(s: string) => d.querySelector<T>(s)!;
  const stage = $('[data-vw-stage]'), layer = $('[data-vw-layer]'), img = layer.querySelector('img')!;
  const label = $('[data-vw-label]'), sheet = $('[data-vw-sheet]');
  const head = $('[data-vw-head]'), hl = $('[data-vw-hl]'), dl = $('[data-vw-dlabel]'), dt = $('[data-vw-dtext]');
  const thumbs = [...d.querySelectorAll<HTMLButtonElement>('[data-vw-thumb]')];
  const rings = [...d.querySelectorAll<HTMLButtonElement>('[data-vw-hot]')];
  const reduced = () => matchMedia(MQ.reduced).matches;

  let cur = 0, active = -1;
  let fw = 1, fh = 1, SW = 1, SH = 1; // fitted image size and stage size
  let s = 1, x = 0, y = 0; // scale and the layer's top-left in the stage

  const clampPos = () => {
    const w = fw * s, h = fh * s;
    x = w <= SW ? (SW - w) / 2 : Math.min(0, Math.max(SW - w, x));
    y = h <= SH ? (SH - h) / 2 : Math.min(0, Math.max(SH - h, y));
  };
  const paint = (glide = false) => {
    const t = glide && !reduced() ? GLIDE : 'none';
    layer.style.transition = t;
    layer.style.transform = `translate(${x}px,${y}px) scale(${s})`;
    rings.forEach((r) => { r.style.transition = t; r.style.transform = `translate(-50%,-50%) scale(${1 / s})`; });
    label.textContent = `${shots[cur].name} · ${(Math.round(s * 10) / 10).toString()}×`;
  };
  const fit = () => {
    SW = stage.clientWidth; SH = stage.clientHeight;
    const iw = img.naturalWidth || 4, ih = img.naturalHeight || 3;
    const k = Math.min(SW / iw, SH / ih);
    fw = iw * k; fh = ih * k;
    layer.style.width = fw + 'px'; layer.style.height = fh + 'px';
  };
  const reset = () => { fit(); s = 1; clampPos(); paint(); };
  // Zoom to scale ns keeping the stage point (px, py) still.
  const zoomAt = (ns: number, px: number, py: number, glide = false) => {
    ns = Math.max(1, Math.min(MAX, ns));
    const u = (px - x) / s, v = (py - y) / s;
    s = ns; x = px - u * s; y = py - v * s;
    clampPos(); paint(glide);
  };

  const showHot = (i: number, glide = true) => {
    if (!hots.length) return;
    if (cur !== 0) show(0);
    active = (i + hots.length) % hots.length;
    const h = hots[active];
    s = HOT_SCALE; x = SW / 2 - h.x * fw * s; y = SH / 2 - h.y * fh * s;
    clampPos(); paint(glide);
    rings.forEach((r, k) => r.classList.toggle('vw-on', k === active));
    hl.textContent = `Detail ${active + 1} of ${hots.length}`;
    dl.textContent = h.label; dt.textContent = h.text;
    dl.hidden = dt.hidden = false;
  };
  const show = (k: number) => {
    cur = k;
    img.src = shots[k].src; img.alt = shots[k].alt;
    thumbs.forEach((t, j) => t.classList.toggle('vw-on', j === k));
    rings.forEach((r) => { r.hidden = k !== 0; r.classList.remove('vw-on'); });
    active = -1;
    if (hots.length) { hl.textContent = `Detail 1 of ${hots.length}`; dl.hidden = dt.hidden = true; }
    if (img.complete) reset(); else img.onload = reset;
  };

  head.hidden = !hots.length;
  sheet.hidden = !hots.length && shots.length < 2;
  d.querySelector('[data-vw-prev]')?.addEventListener('click', () => showHot(active < 0 ? hots.length - 1 : active - 1));
  d.querySelector('[data-vw-next]')?.addEventListener('click', () => showHot(active + 1));
  rings.forEach((r, k) => r.addEventListener('click', (e) => { e.stopPropagation(); showHot(k); }));
  thumbs.forEach((t, k) => t.addEventListener('click', () => show(k)));

  // Gestures: pinch, pan, double-tap, swipe down at 1×.
  const pts = new Map<number, { x: number; y: number }>();
  let pinch: { d0: number; s0: number; u: number; v: number } | null = null;
  let pan: { x0: number; y0: number; px: number; py: number; t0: number; down: boolean } | null = null;
  let lastTap = { t: 0, x: 0, y: 0 }, moved = false;
  const rel = (e: PointerEvent) => { const r = stage.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const mid = () => { const [a, b] = [...pts.values()]; return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, d: Math.hypot(a.x - b.x, a.y - b.y) }; };

  stage.addEventListener('pointerdown', (e) => {
    if ((e.target as Element).closest('[data-vw-hot]')) return;
    stage.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, rel(e));
    moved = false;
    if (pts.size === 2) {
      const m = mid();
      pinch = { d0: m.d || 1, s0: s, u: (m.x - x) / s, v: (m.y - y) / s };
      pan = null;
    } else if (pts.size === 1) {
      const p = rel(e);
      pan = { x0: p.x, y0: p.y, px: x, py: y, t0: performance.now(), down: s <= 1.001 };
    }
    paint();
  });
  stage.addEventListener('pointermove', (e) => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, rel(e));
    if (pinch && pts.size === 2) {
      const m = mid();
      s = Math.max(1, Math.min(MAX, pinch.s0 * (m.d / pinch.d0)));
      x = m.x - pinch.u * s; y = m.y - pinch.v * s;
      clampPos(); paint(); moved = true;
    } else if (pan && pts.size === 1) {
      const p = rel(e), dx = p.x - pan.x0, dy = p.y - pan.y0;
      if (Math.hypot(dx, dy) > 6) moved = true;
      if (pan.down) {
        // At 1×, a downward drag pulls the image away to close.
        const pull = Math.max(0, dy);
        layer.style.transition = 'none';
        layer.style.transform = `translate(${x}px,${y + pull}px) scale(${s})`;
        d.style.opacity = String(1 - Math.min(0.6, pull / 400));
      } else {
        x = pan.px + dx; y = pan.py + dy; clampPos(); paint();
      }
    }
  });
  const up = (e: PointerEvent) => {
    if (!pts.has(e.pointerId)) return;
    const p = rel(e);
    pts.delete(e.pointerId);
    if (pinch) { if (pts.size < 2) { pinch = null; pan = null; } return; }
    if (pan?.down) {
      const dy = p.y - pan.y0, v = dy / Math.max(1, performance.now() - pan.t0);
      d.style.opacity = '';
      if (dy > 100 || (dy > 30 && v > 0.5)) { pan = null; close(); return; }
      paint(true);
    }
    pan = null;
    if (!moved) {
      const now = performance.now();
      if (now - lastTap.t < 300 && Math.hypot(p.x - lastTap.x, p.y - lastTap.y) < 30) {
        zoomAt(s < 1.9 ? 2 : s < 3.9 ? 4 : 1, p.x, p.y, true);
        lastTap.t = 0;
      } else lastTap = { t: now, x: p.x, y: p.y };
    }
  };
  stage.addEventListener('pointerup', up);
  stage.addEventListener('pointercancel', up);

  const close = () => { if (d.open) d.close(); };
  d.querySelector('[data-vw-close]')?.addEventListener('click', close);
  d.addEventListener('close', () => { document.documentElement.classList.remove('mn-lock'); d.style.opacity = ''; });
  addEventListener('resize', () => { if (d.open) reset(); });

  return {
    open(k = 0, hot = -1) {
      d.showModal();
      document.documentElement.classList.add('mn-lock');
      show(k);
      if (hot >= 0) { const go = () => showHot(hot, false); if (img.complete) go(); else img.addEventListener('load', go, { once: true }); }
    },
  };
}
