// Static search index for /search, rebuilt on every deploy from Notion data.
// Its four groups follow the Search reference's build(): Objects (keyed on
// year, era, origin, maker, field and date), Narratives, Fields (each field
// with its object count) and the site's Pages.
import type { APIRoute } from 'astro';
import { getSiteData } from '../lib/notion';

export const GET: APIRoute = async () => {
  const { items, narratives } = await getSiteData();

  const objects = items.map((i) => ({
    t: i.name,
    u: `/collection/${i.slug}`,
    k: [i.year ?? '', i.era, i.originCountry, i.maker, i.categoryName ?? '', i.dateLabel].join(' '),
    d: i.shortDescription || '',
    m: (i.year ?? '') + ' · ' + i.originCountry,
    i: i.thread === 'The Island' ? 1 : 0,
  }));

  const narrs = narratives
    .filter((n) => n.publishStatus === 'Published')
    .map((n) => ({ t: n.name, u: `/narratives/${n.slug}`, k: '', d: n.premise || '', m: `${n.itemIds.length} objects` }));

  // Fields in the order they first appear among the objects.
  const counts = new Map<string, number>();
  items.forEach((i) => { if (i.categoryName) counts.set(i.categoryName, (counts.get(i.categoryName) ?? 0) + 1); });
  const fields = [...counts].map(([name, n]) => ({ t: name, u: '/collection', k: '', d: '', m: `${n} objects` }));

  const pages = [
    { t: 'Collection', u: '/collection', k: 'all objects archive browse', d: 'Every object in the archive.', m: '' },
    { t: 'Narratives', u: '/narratives', k: 'stories articles constellations', d: 'Stories told across objects.', m: '' },
    { t: 'Timeline', u: '/timeline', k: 'year dial sky', d: 'The sky over time.', m: '' },
    { t: 'The Island', u: '/the-island', k: 'sri lanka ceylon thread', d: 'Sri Lanka across every century.', m: '' },
    { t: 'Seeking', u: '/seeking', k: 'want list wanted notices', d: 'The public want-list.', m: '' },
    { t: 'About', u: '/about', k: 'curator yulan galagoda yg contact', d: 'The archive and its curator.', m: '' },
    { t: 'Collecting Policy', u: '/collecting-policy', k: 'policy scope threads', d: '', m: '' },
    { t: 'Verification & Provenance', u: '/verification-and-provenance', k: 'authentication verified research ongoing', d: '', m: '' },
    { t: 'Access, Citation & Image Use', u: '/access-citation-image-use', k: 'licence research cite images', d: '', m: '' },
    { t: 'Annual Review', u: '/annual-review', k: 'review year june', d: '', m: '' },
  ];

  return new Response(
    JSON.stringify({ objects, narratives: narrs, fields, pages }),
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } }
  );
};
