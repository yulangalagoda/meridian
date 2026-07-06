// Post-build link check — fails the build if any internal link points nowhere.
// An archive of record must never ship a dead link.
//
// Valid targets: a generated route (dist/<path>/index.html), a static file in
// dist (/images/…, /_astro/…, /favicon.svg …), or a redirect source declared
// in public/_redirects.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

if (!fs.existsSync(dist)) {
  console.error('[check-links] dist/ not found — run astro build first.');
  process.exit(1);
}

// ── Collect every HTML file in dist ─────────────────────────────────────────
function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

const htmlFiles = [...walk(dist)].filter((f) => f.endsWith('.html'));

// ── Redirect sources (and targets, which must themselves resolve) ───────────
const redirectSources = new Set();
const redirectTargets = [];
const redirectsFile = path.join(dist, '_redirects');
if (fs.existsSync(redirectsFile)) {
  for (const line of fs.readFileSync(redirectsFile, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const [src, dest] = t.split(/\s+/);
    if (src) redirectSources.add(src.replace(/\/$/, '') || '/');
    if (dest && dest.startsWith('/')) redirectTargets.push(dest);
  }
}

// ── Resolution ───────────────────────────────────────────────────────────────
function resolves(rawHref) {
  let p = rawHref.split('#')[0].split('?')[0];
  if (!p || p === '/') return true;
  p = decodeURIComponent(p);
  const clean = p.replace(/\/$/, '');
  if (redirectSources.has(clean)) return true;
  const asFile = path.join(dist, clean);
  if (fs.existsSync(asFile) && fs.statSync(asFile).isFile()) return true;
  if (fs.existsSync(path.join(asFile, 'index.html'))) return true;
  return false;
}

// ── Scan ─────────────────────────────────────────────────────────────────────
const broken = new Map(); // href -> [pages]
const hrefRe = /(?:href|src)="(\/[^"/][^"]*)"/g;

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const page = '/' + path.relative(dist, file).replace(/\\/g, '/');
  for (const m of html.matchAll(hrefRe)) {
    const href = m[1];
    if (!resolves(href)) {
      if (!broken.has(href)) broken.set(href, []);
      const pages = broken.get(href);
      if (pages.length < 5) pages.push(page);
    }
  }
}

// Redirect targets must not themselves be dead
for (const dest of redirectTargets) {
  if (!resolves(dest)) {
    broken.set(dest, ['(redirect target in _redirects)']);
  }
}

if (broken.size) {
  console.error(`\n[check-links] ✗ ${broken.size} dead internal link(s):\n`);
  for (const [href, pages] of broken) {
    console.error(`  ${href}`);
    for (const p of pages) console.error(`      referenced by ${p}`);
  }
  console.error('\nBuild rejected — fix the links or add redirects.\n');
  process.exit(1);
}

console.log(`[check-links] ✓ ${htmlFiles.length} pages scanned, no dead internal links.`);
