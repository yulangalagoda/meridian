// Bottom sheets (Responsive System board, 3b): a native <dialog> that slides up
// from the bottom (max 62dvh, scrolls inside). Close it by dragging the handle
// down, the ×, a tap outside it, or Esc. Reduced motion opens and closes it
// without the slide. The page behind holds still while one is open.
import { MQ } from './responsive';

const DUR = 300;
const reduced = () => matchMedia(MQ.reduced).matches;
const panelOf = (d: HTMLDialogElement) => d.querySelector<HTMLElement>('[data-sheet-panel]')!;

export function openSheet(d: HTMLDialogElement) {
  if (d.open) return;
  d.showModal();
  document.documentElement.classList.add('mn-lock');
  const p = panelOf(d);
  p.scrollTop = 0;
  p.style.transform = '';
  if (!reduced()) p.animate([{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], { duration: DUR, easing: 'cubic-bezier(.16,1,.3,1)' });
  d.dispatchEvent(new CustomEvent('sheet:open'));
}

export function closeSheet(d: HTMLDialogElement) {
  if (!d.open || d.dataset.closing) return;
  const p = panelOf(d);
  const done = () => { delete d.dataset.closing; p.style.transform = ''; d.close(); };
  if (reduced()) return done();
  d.dataset.closing = '1';
  const from = p.style.transform || 'translateY(0)';
  p.animate([{ transform: from }, { transform: 'translateY(100%)' }], { duration: DUR * 0.7, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' }).finished.then(() => {
    done();
    p.getAnimations().forEach((a) => a.cancel());
  });
}

export function wireSheet(d: HTMLDialogElement) {
  if (d.dataset.wired) return;
  d.dataset.wired = '1';
  const p = panelOf(d);
  d.addEventListener('cancel', (e) => { e.preventDefault(); closeSheet(d); });
  d.addEventListener('close', () => {
    document.documentElement.classList.remove('mn-lock');
    d.dispatchEvent(new CustomEvent('sheet:close'));
  });
  // A tap outside the panel lands on the dialog's backdrop.
  d.addEventListener('click', (e) => { if (e.target === d) closeSheet(d); });
  d.querySelectorAll('[data-sheet-close]').forEach((b) => b.addEventListener('click', () => closeSheet(d)));

  // Drag the handle (or the head row) down to close.
  const grip = d.querySelectorAll<HTMLElement>('[data-sheet-grip]');
  let y0 = 0, t0 = 0, dy = 0, dragging = false;
  grip.forEach((g) => {
    g.addEventListener('pointerdown', (e) => {
      if ((e.target as Element).closest('button,a')) return;
      dragging = true; y0 = e.clientY; t0 = performance.now(); dy = 0;
      g.setPointerCapture(e.pointerId);
    });
    g.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      dy = Math.max(0, e.clientY - y0);
      p.style.transform = `translateY(${dy}px)`;
    });
    const end = () => {
      if (!dragging) return;
      dragging = false;
      const v = dy / Math.max(1, performance.now() - t0);
      if (dy > 80 || v > 0.5) closeSheet(d);
      else if (dy > 0) {
        const from = p.style.transform;
        p.style.transform = '';
        if (!reduced()) p.animate([{ transform: from }, { transform: 'translateY(0)' }], { duration: 200, easing: 'cubic-bezier(.16,1,.3,1)' });
      }
    };
    g.addEventListener('pointerup', end);
    g.addEventListener('pointercancel', end);
  });
}

// Every sheet on the page, and every [data-sheet-open="id"] that opens one.
export function wireSheets() {
  document.querySelectorAll<HTMLDialogElement>('dialog[data-sheet]').forEach(wireSheet);
  document.querySelectorAll<HTMLElement>('[data-sheet-open]').forEach((b) => {
    const d = document.getElementById(b.dataset.sheetOpen!) as HTMLDialogElement | null;
    if (d && !b.dataset.wired) { b.dataset.wired = '1'; b.addEventListener('click', () => openSheet(d)); }
  });
}
