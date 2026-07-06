// Static search index for the ⌘K palette (and the 404 did-you-mean).
// Rebuilt on every deploy from Notion data.
import type { APIRoute } from 'astro';
import { getSiteData } from '../lib/notion';

export const GET: APIRoute = async () => {
  const { items, categories, narratives } = await getSiteData();

  const objects = items.map((i) => ({
    t: i.name,
    u: `/collection/${i.slug}`,
    k: [i.year !== null ? String(i.year) : '', i.era, i.originCountry, i.maker, i.categoryName ?? '', ...i.tags]
      .filter(Boolean)
      .join(' '),
    d: i.shortDescription || '',
    m: [i.year !== null ? (i.year < 0 ? `${Math.abs(i.year)} BCE` : String(i.year)) : null, i.originCountry || null]
      .filter(Boolean)
      .join(' · '),
  }));

  const fields = categories
    .filter((c) => c.publishStatus === 'Published' && items.some((i) => i.categorySlug === c.slug))
    .map((c) => ({
      t: c.name,
      u: `/categories/${c.slug}`,
      k: c.description || '',
      d: c.description || '',
      m: `${items.filter((i) => i.categorySlug === c.slug).length} objects`,
    }));

  const narrs = narratives
    .filter((n) => n.publishStatus === 'Published')
    .map((n) => ({
      t: n.name,
      u: `/narratives/${n.slug}`,
      k: n.premise || '',
      d: n.premise || '',
      m: `${n.itemIds.length} objects`,
    }));

  const pages = [
    { t: 'Collection', u: '/collection', k: 'all objects archive browse', d: 'Every object in the archive.', m: '' },
    { t: 'Categories', u: '/categories', k: 'fields browse', d: 'The fields of the collection.', m: '' },
    { t: 'Narratives', u: '/narratives', k: 'stories articles', d: 'Stories told across objects.', m: '' },
    { t: 'Seeking', u: '/seeking', k: 'want list wanted notices', d: 'The public want-list.', m: '' },
    { t: 'About', u: '/about', k: 'curator yulan galagoda', d: 'The archive and its curator.', m: '' },
    { t: 'Collecting Policy', u: '/collecting-policy', k: 'policy scope', d: '', m: '' },
    { t: 'Verification & Provenance', u: '/verification-and-provenance', k: 'authentication', d: '', m: '' },
    { t: 'Access, Citation & Image Use', u: '/access-citation-image-use', k: 'licence research', d: '', m: '' },
    { t: 'Annual Review', u: '/annual-review', k: 'review year', d: '', m: '' },
  ];

  return new Response(
    JSON.stringify({ objects, narratives: narrs, fields, pages }),
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } }
  );
};
