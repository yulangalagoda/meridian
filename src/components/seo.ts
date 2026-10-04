// Structured data (schema.org JSON-LD) and the descriptions crawlers read.
// Pages build their blocks with these helpers and pass them to NightSky.
import type { Item, Narrative } from '../lib/types';
import { CONTACT_EMAIL } from './archive/types';

export const SITE = 'https://meridian.yulan.me';
export const abs = (path: string) => new URL(path, SITE).href;

export const CURATOR = {
  '@type': 'Person',
  '@id': SITE + '/#curator',
  name: 'Yulan Galagoda',
  url: 'https://yulan.me',
  email: 'mailto:' + CONTACT_EMAIL,
  jobTitle: 'Curator',
  address: { '@type': 'PostalAddress', addressLocality: 'Plymouth', addressCountry: 'GB' },
  knowsAbout: ['Antiques', 'Sri Lanka history', 'Ceylon colonial history', 'Scientific instruments', 'Antiquarian books', 'Early photography', 'Cartography', 'Provenance research'],
};

const WEBSITE_REF = { '@type': 'WebSite', '@id': SITE + '/#website', name: 'The Meridian', url: SITE + '/' };

export const yearSpan = (items: Item[]) => {
  const ys = items.map((i) => i.year).filter((y): y is number => y !== null);
  return ys.length ? Math.min(...ys) + '–' + Math.max(...ys) : '';
};

export function breadcrumbs(trail: [string, string][]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(path) })),
  };
}

export function webPage(name: string, path: string, description: string, type = 'WebPage') {
  return {
    '@context': 'https://schema.org',
    '@type': type,
    name,
    url: abs(path),
    description,
    inLanguage: 'en-GB',
    isPartOf: WEBSITE_REF,
    author: { '@id': CURATOR['@id'] },
  };
}

// A page that lists objects or narratives.
export function listPage(name: string, path: string, description: string, entries: { name: string; path: string }[]) {
  return {
    ...webPage(name, path, description, 'CollectionPage'),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: entries.length,
      itemListElement: entries.map((e, i) => ({ '@type': 'ListItem', position: i + 1, name: e.name, url: abs(e.path) })),
    },
  };
}

export function website(description: string, items: Item[]) {
  return [
    {
      '@context': 'https://schema.org',
      ...WEBSITE_REF,
      alternateName: 'The Meridian Archive',
      description,
      inLanguage: 'en-GB',
      publisher: { '@id': CURATOR['@id'] },
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: SITE + '/search/?q={search_term_string}' },
        'query-input': 'required name=search_term_string',
      },
    },
    { '@context': 'https://schema.org', ...CURATOR },
    {
      '@context': 'https://schema.org',
      '@type': 'Collection',
      name: 'The Meridian Collection',
      url: abs('/collection/'),
      description: `${items.length} antiques and historical objects, ${yearSpan(items)}.`,
      collectionSize: items.length,
    },
  ];
}

export function objectData(item: Item) {
  const path = `/collection/${item.slug}/`;
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: item.name,
      url: abs(path),
      description: item.shortDescription || item.story,
      ...(item.primaryImage && { image: abs(item.primaryImage) }),
      ...(item.year !== null && { dateCreated: String(item.year) }),
      ...(item.maker && { creator: { '@type': 'Organization', name: item.maker } }),
      ...(item.materials && { material: item.materials }),
      ...(item.originCountry && { countryOfOrigin: { '@type': 'Country', name: item.originCountry } }),
      ...(item.categoryName && { genre: item.categoryName }),
      ...(item.tags.length && { keywords: item.tags.join(', ') }),
      isPartOf: { '@type': 'Collection', name: 'The Meridian Collection', url: abs('/collection/') },
    },
    breadcrumbs([['The Meridian', '/'], ['Collection', '/collection/'], [item.name, path]]),
  ];
}

export function narrativeData(n: Narrative, its: Item[], image?: string | null) {
  const path = `/narratives/${n.slug}/`;
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: n.name,
      description: n.premise,
      url: abs(path),
      inLanguage: 'en-GB',
      ...(image && { image: abs(image) }),
      author: { '@id': CURATOR['@id'], '@type': 'Person', name: CURATOR.name, url: CURATOR.url },
      publisher: { '@type': 'Organization', name: 'The Meridian', url: SITE + '/' },
      isPartOf: WEBSITE_REF,
      about: its.map((i) => ({ '@type': 'CreativeWork', name: i.name, url: abs(`/collection/${i.slug}/`) })),
    },
    breadcrumbs([['The Meridian', '/'], ['Narratives', '/narratives/'], [n.name, path]]),
  ];
}
