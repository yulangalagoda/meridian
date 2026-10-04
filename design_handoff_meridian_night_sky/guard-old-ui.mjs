// Fails if any trace of the old UI is left in src/. Run: node design_handoff_meridian_night_sky/guard-old-ui.mjs
import fs from 'node:fs';
import path from 'node:path';

const BANNED = ['#F4EFE6', '#ECE5D6', '#E4DBC9', '#C9BCA4', '#1A130B', '#3A2E20', '#5A4836', '#776349', '#7A2E22', '#8E3A2C', '#3F6B32', '#7A5C18', '#17110A', '#211910', '#CD8268', 'Libre Caslon', '--paper', '--oxblood', '--ink-mute', '--stone', 'colophon', 'railhead', 'leadbody', 'masthead', 'MeridianArc', 'FilterBar', 'ItemCard', 'CategoryIcon', 'filter-btn', 'palette__row', 'data-theme'];
const REQUIRED = ['#070A14', 'Gloock', 'EB Garamond', 'IBM Plex Mono'];
const files = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.(astro|css|ts|tsx|js|jsx|mjs)$/.test(e.name)) files.push(p); } })('src');

const hits = [], all = [];
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8'); all.push(src);
  const low = src.toLowerCase();
  for (const b of BANNED) if (low.includes(b.toLowerCase())) hits.push(`${f}: ${b}`);
}
const joined = all.join('\n').toLowerCase();
const missing = REQUIRED.filter(r => !joined.includes(r.toLowerCase()));
if (hits.length || missing.length) {
  if (hits.length) console.error('Old UI found:\n  ' + hits.join('\n  '));
  if (missing.length) console.error('Night Sky essentials missing: ' + missing.join(', '));
  process.exit(1);
}
console.log(`guard-old-ui: clean (${files.length} files)`);
