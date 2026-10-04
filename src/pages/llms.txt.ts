// llms.txt: a plain-language map of the site for language models and agents,
// rebuilt on every deploy so its routes, counts and lists match the site.
// functions/_middleware.js also serves it to any request that asks for
// text/markdown.
import type { APIRoute } from 'astro';
import { POLICY_PAGES, getSiteData } from '../lib/notion';
import { SITE, yearSpan } from '../components/seo';
import { CONTACT_EMAIL } from '../components/archive/types';

export const GET: APIRoute = async () => {
  const { items, narratives } = await getSiteData();
  const bare = (id: string) => id.replace(/-/g, '');
  const island = items.filter((i) => i.thread === 'The Island');
  const span = yearSpan(items);
  const url = (p: string) => SITE + p;

  const narr = narratives.map((n) => {
    const its = n.itemIds.map((id) => items.find((i) => bare(i.id) === id)).filter(Boolean) as typeof items;
    return `- [${n.name}](${url(`/narratives/${n.slug}/`)}): ${n.premise} (${its.length} objects, ${yearSpan(its)})`;
  });
  const objs = items.slice().sort((a, b) => (a.year ?? 0) - (b.year ?? 0) || a.displayOrder - b.displayOrder).map((i) =>
    `- [${i.name}](${url(`/collection/${i.slug}/`)}): ${[i.dateLabel, i.originCountry, i.categoryName, i.verification].filter(Boolean).join(' · ')}${i.thread === 'The Island' ? ' · The Island' : ''}. ${i.shortDescription}`
  );
  const policy = Object.entries(POLICY_PAGES).map(([slug, p]) => `- [${p.title}](${url(`/${slug}/`)}): ${p.description}`);

  const body = `# The Meridian

> A private archive of ${items.length} antiques and historical objects, ${span}, kept by Yulan Galagoda. Every object is a star placed by the year it was made, and the ${narratives.length} narratives are drawn as constellations between them. It is not a shop: nothing is for sale. It is a record.

The Meridian collects along two threads. The Island: Sri Lanka and Ceylon across every century (maps, photographs, documents, autographs and books), ${island.length} objects so far. The Instruments of Progress: the small objects by which people learned to measure, record, calculate and see (slide rules, barometers, typewriters, cameras, and the books that carried ideas), ${items.length - island.length} objects.

Every object page carries its maker, materials, origin, era, dimensions and condition, a verification status (Verified or Research Ongoing), its provenance, a researched story in numbered sections with references, and a citation: "Object name, The Meridian, collection of Yulan Galagoda, meridian.yulan.me/collection/[slug]".

## Explore

- [Home](${url('/')}): the opening ceremony, the sky of every object with its constellations, the narratives and the two threads.
- [Collection](${url('/collection/')}): every object, arranged by field, by era or A–Z; show all, The Island only, or research ongoing.
- [Timeline](${url('/timeline/')}): the sky over time. A dial runs across ${span}; each object rises as a star in its year, narratives form as constellations once their last object has risen, and the era shelves below hold every object.
- [The Island](${url('/the-island/')}): the Island thread in year order, with the years between objects, and what the thread is still seeking.
- [Narratives](${url('/narratives/')}): all ${narratives.length} constellations in one sky, with a card for each story.
- [Search](${url('/search/')}): objects, narratives, fields and pages. Link a query as ${url('/search/?q=')}{words}.
- [Search index](${url('/search-index.json')}): the same index as JSON ({objects, narratives, fields, pages}, each entry with t title, u url, k keywords, d description, m meta).
- [Sitemap](${url('/sitemap-index.xml')})

## Narratives

${narr.join('\n')}

## Objects, in the order they were made

${objs.join('\n')}

## The Archive

- [About](${url('/about/')}): the archive and its curator.
${policy.join('\n')}

## Curator and contact

Yulan Galagoda, collector and curator, Plymouth, United Kingdom.
- ${CONTACT_EMAIL}
- https://yulan.me
`;
  return new Response(body, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
