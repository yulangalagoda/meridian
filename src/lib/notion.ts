import { Client } from '@notionhq/client';
import { ensureImagesDir, downloadPrimary, downloadGallery, downloadCategoryImage } from './images';
import { fetchAllBlocks, fetchBlockTree, renderBlocks, renderSpans, plainText } from './richtext';
import type { Item, ItemDetail, Category, Narrative, NarrativeContent, NarrativeSection, SiteData } from './types';

const DATA_SOURCES = {
  items: '91ecf100-9c66-4f70-a03a-a11e0dfd2d20',
  categories: 'c9651011-b65b-419f-8fb5-80a4a70a9289',
  narratives: 'fb3b85da-d3a8-4c39-a85b-a70648d55b92',
} as const;

export const ABOUT_PAGE_ID = '36356d83-11d2-804e-b7a8-c2494f19a19c';

// The root "The Meridian" page: its opening paragraph is the epigraph, and the
// Charter's Thesis lists the two threads.
export const ROOT_PAGE_ID = '36156d83-11d2-81c5-8752-fcd5bf419dd7';

// Public policy / archive pages maintained as Notion sub-pages
export const POLICY_PAGES = {
  'collecting-policy': {
    id: '37b56d83-11d2-816c-928d-f1a4969f03c9',
    title: 'Collecting Policy',
    kicker: 'The Archive',
    description:
      'The public scope statement of The Meridian: the two collecting threads — Sri Lanka across every century, and the instruments of measurement and record — and the upgrade-only growth doctrine.',
  },
  'verification-and-provenance': {
    id: '37b56d83-11d2-81ef-91c7-cd60952e77cf',
    title: 'Verification & Provenance',
    kicker: 'The Archive',
    description:
      'The authentication standard of The Meridian: how every object is verified or researched into verifiability, and what the per-item Verified and Research Ongoing labels mean.',
  },
  'seeking': {
    id: '37b56d83-11d2-819e-8a0c-f80eb5c6bdf4',
    title: 'Seeking',
    kicker: 'The Archive',
    description:
      'The public want list of The Meridian: Ceylon photographs, documents and autographs, and scientific instruments the archive is actively seeking.',
  },
  'access-citation-image-use': {
    id: '37b56d83-11d2-813d-8154-d17d0b0dcaea',
    title: 'Access, Citation & Image Use',
    kicker: 'The Archive',
    description:
      'Research inquiries, viewing arrangements, citation format, and the image licence for The Meridian archive.',
  },
  'annual-review': {
    id: '37b56d83-11d2-81c2-be54-cd114f24a4a7',
    title: 'Annual Review',
    kicker: 'The Archive',
    description:
      'What the collection learned this year — one paragraph each June, published since the founding of The Meridian.',
  },
} as const;

export type PolicySlug = keyof typeof POLICY_PAGES;

function notionClient(): Client {
  const token = (import.meta.env.NOTION_TOKEN as string | undefined) ?? process.env.NOTION_TOKEN;
  if (!token) {
    throw new Error(
      'NOTION_TOKEN is not set. Add it to .env for local development or to Cloudflare Pages environment variables for production.'
    );
  }
  return new Client({ auth: token, notionVersion: '2025-09-03' });
}

type AnyProps = Record<string, any>;

function getTitle(props: AnyProps, name: string): string {
  const p = props?.[name];
  if (!p) return '';
  if (p.type === 'title') return plainText(p.title);
  return '';
}

function getText(props: AnyProps, name: string): string {
  const p = props?.[name];
  if (!p) return '';
  if (p.type === 'rich_text') return plainText(p.rich_text);
  if (p.type === 'text') return p.text ?? '';
  return '';
}

function getNumber(props: AnyProps, name: string): number {
  const p = props?.[name];
  if (!p) return 0;
  if (p.type === 'number') return typeof p.number === 'number' ? p.number : 0;
  if (p.type === 'unique_id') return p.unique_id?.number ?? 0;
  if (typeof p === 'number') return p;
  return 0;
}

function getNumberOrNull(props: AnyProps, name: string): number | null {
  const p = props?.[name];
  if (p?.type === 'number') return typeof p.number === 'number' ? p.number : null;
  return null;
}

// Details is a JSON text property: [{x, y, label, text}] with x and y as 0–1 fractions.
// Anything malformed is dropped rather than failing the build.
function getDetails(props: AnyProps, name: string): ItemDetail[] {
  const raw = getText(props, name).trim();
  if (!raw) return [];
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { return []; }
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(
    (d: any): d is ItemDetail =>
      d && typeof d.x === 'number' && typeof d.y === 'number' &&
      d.x >= 0 && d.x <= 1 && d.y >= 0 && d.y <= 1 &&
      typeof d.label === 'string' && typeof d.text === 'string'
  );
}

function getCheckbox(props: AnyProps, name: string): boolean {
  const p = props?.[name];
  if (!p) return false;
  if (p.type === 'checkbox') return Boolean(p.checkbox);
  // Data sources encode checkbox as string sentinels
  if (typeof p === 'string') return p === '__YES__';
  return false;
}

function getSelect(props: AnyProps, name: string): string {
  const p = props?.[name];
  if (!p) return '';
  if (p.type === 'select') return p.select?.name ?? '';
  if (p.type === 'status') return p.status?.name ?? '';
  if (typeof p === 'string') return p;
  return '';
}

function getMultiSelect(props: AnyProps, name: string): string[] {
  const p = props?.[name];
  if (!p) return [];
  if (p.type === 'multi_select') {
    return (p.multi_select as Array<{ name: string }>).map((s) => s.name);
  }
  // Data sources may return a JSON array string
  if (typeof p === 'string') {
    try { return JSON.parse(p); } catch { return []; }
  }
  return [];
}

function getFiles(props: AnyProps, name: string): any[] {
  const p = props?.[name];
  if (!p) return [];
  if (p.type === 'files') return p.files ?? [];
  // Data sources return a JSON array of file objects
  if (typeof p === 'string') {
    try { return JSON.parse(p); } catch { return []; }
  }
  if (Array.isArray(p)) return p;
  return [];
}

function getRelationIds(props: AnyProps, name: string): string[] {
  const p = props?.[name];
  if (!p) return [];
  if (p.type === 'relation') return (p.relation as Array<{ id: string }>).map((r) => r.id.replace(/-/g, ''));
  // Data sources return relation fields as a JS Array of page URL strings
  let arr: string[] = [];
  if (Array.isArray(p)) {
    arr = p;
  } else if (typeof p === 'string') {
    try { arr = JSON.parse(p); } catch { return []; }
  } else {
    return [];
  }
  return arr.map((url: string) => {
    const parts = url.split('/');
    const last = parts[parts.length - 1];
    return last.split('?')[0].replace(/-/g, '');
  });
}

async function queryDataSource(client: Client, dataSourceId: string): Promise<any[]> {
  const results: any[] = [];
  let cursor: string | undefined;
  do {
    const body: Record<string, unknown> = {
      filter: {
        property: 'Publish Status',
        select: { equals: 'Published' },
      },
      sorts: [{ property: 'Display Order', direction: 'ascending' }],
      page_size: 100,
    };
    if (cursor) body.start_cursor = cursor;
    const res: any = await (client as any).request({
      path: `data_sources/${dataSourceId}/query`,
      method: 'post',
      body,
    });
    results.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return results;
}

export async function fetchSiteData(): Promise<SiteData> {
  ensureImagesDir();
  const client = notionClient();

  const [rawItems, rawCategories, rawNarratives, aboutBlocks] = await Promise.all([
    queryDataSource(client, DATA_SOURCES.items),
    queryDataSource(client, DATA_SOURCES.categories),
    queryDataSource(client, DATA_SOURCES.narratives),
    fetchAllBlocks(client, ABOUT_PAGE_ID),
  ]);

  // Build category lookup: page id (no dashes) → { name, slug }
  const categoryMap = new Map<string, { name: string; slug: string; id: string }>();

  const categories: Category[] = await Promise.all(
    rawCategories.map(async (page: any) => {
      const props = page.properties;
      const slug = getText(props, 'Slug') || getTitle(props, 'Name').toLowerCase().replace(/\s+/g, '-');
      const coverImage = await downloadCategoryImage(slug, getFiles(props, 'Cover Image'));
      const cat: Category = {
        id: page.id,
        slug,
        name: getTitle(props, 'Name'),
        description: getText(props, 'Description'),
        icon: getText(props, 'Icon'),
        displayOrder: getNumber(props, 'Display Order'),
        coverImage,
        publishStatus: getSelect(props, 'Publish Status'),
      };
      categoryMap.set(page.id.replace(/-/g, ''), cat);
      return cat;
    })
  );

  // Fetch all item blocks in parallel with item processing
  const items: Item[] = await Promise.all(
    rawItems.map(async (page: any) => {
      const props = page.properties;
      const slug = getText(props, 'Slug') || getTitle(props, 'Name').toLowerCase().replace(/\s+/g, '-');

      const [primaryImage, galleryImages] = await Promise.all([
        downloadPrimary(slug, getFiles(props, 'Primary Image')),
        downloadGallery(slug, getFiles(props, 'Gallery Images')),
      ]);

      const catIds = getRelationIds(props, 'Category');
      const cat = catIds.length ? categoryMap.get(catIds[0]) : undefined;

      const yearRaw = getNumber(props, 'Year');

      return {
        id: page.id,
        slug,
        name: getTitle(props, 'Name'),
        shortDescription: getText(props, 'Short Description'),
        story: getText(props, 'Story'),
        year: yearRaw !== 0 ? yearRaw : null,
        dateDetail: getText(props, 'Date Detail'),
        dateLabel: getText(props, 'Date Label'),
        era: getSelect(props, 'Era'),
        categoryId: cat?.id ?? null,
        categoryName: cat?.name ?? null,
        categorySlug: cat?.slug ?? null,
        tags: getMultiSelect(props, 'Tags'),
        maker: getText(props, 'Maker'),
        originCountry: getSelect(props, 'Origin Country'),
        materials: getText(props, 'Materials'),
        dimensions: getText(props, 'Dimensions'),
        condition: getSelect(props, 'Condition'),
        provenance: getText(props, 'Provenance'),
        verification: getSelect(props, 'Verification'),
        narrativeIds: getRelationIds(props, 'Narratives'),
        primaryImage,
        galleryImages,
        galleryCaptions: getText(props, 'Gallery Captions').split('\n').map((c) => c.trim()).filter(Boolean),
        imageAltText: getText(props, 'Image Alt Text'),
        featured: getCheckbox(props, 'Featured'),
        displayOrder: getNumber(props, 'Display Order'),
        publishStatus: getSelect(props, 'Publish Status'),
        itemId: getNumber(props, 'Item ID'),
        thread: getSelect(props, 'Thread'),
        yearFrom: getNumberOrNull(props, 'Year From'),
        yearTo: getNumberOrNull(props, 'Year To'),
        details: getDetails(props, 'Details'),
      } satisfies Item;
    })
  );

  // Narratives — connected stories across objects
  const narratives: Narrative[] = rawNarratives.map((page: any) => {
    const props = page.properties;
    const slug = getText(props, 'Slug') || getTitle(props, 'Name').toLowerCase().replace(/\s+/g, '-');
    return {
      id: page.id,
      slug,
      name: getTitle(props, 'Name'),
      premise: getText(props, 'Premise'),
      displayOrder: getNumber(props, 'Display Order'),
      publishStatus: getSelect(props, 'Publish Status'),
      itemIds: getRelationIds(props, 'Items'),
    } satisfies Narrative;
  });

  const aboutHtml = renderBlocks(aboutBlocks);

  return { items, categories, narratives, aboutHtml };
}

// Fetches the full block content for a policy page (cached per page).
const _policyCache = new Map<string, string>();

export async function fetchPolicyContent(slug: PolicySlug): Promise<string> {
  const cached = _policyCache.get(slug);
  if (cached) return cached;
  const client = notionClient();
  const blocks = await fetchAllBlocks(client, POLICY_PAGES[slug].id);
  const html = renderBlocks(blocks);
  _policyCache.set(slug, html);
  return html;
}

// Fetches a page's blocks with nested children, for the archive pages whose
// layouts are built from individual blocks (cached per page).
const _blockTreeCache = new Map<string, any[]>();

export async function fetchPageBlocks(pageId: string): Promise<any[]> {
  const cached = _blockTreeCache.get(pageId);
  if (cached) return cached;
  const blocks = await fetchBlockTree(notionClient(), pageId);
  _blockTreeCache.set(pageId, blocks);
  return blocks;
}

// The public identity lines from the root page: the epigraph and the two thread
// descriptions ("The Island: …", "The Instruments of Progress: …"), each with
// its label removed. The build fails if any is missing.
export interface Identity { epigraph: string; island: string; instruments: string }
let _identity: Identity | null = null;
export async function fetchIdentity(): Promise<Identity> {
  if (_identity) return _identity;
  const blocks = await fetchAllBlocks(notionClient(), ROOT_PAGE_ID);
  const text = (b: any) => plainText(b[b.type]?.rich_text ?? []).trim();
  const epigraph = text(blocks.find((b) => b.type === 'paragraph' && text(b)) ?? {});
  const thread = (label: string) => {
    const b = blocks.find((x) => x.type === 'numbered_list_item' && text(x).startsWith(label + ':'));
    return b ? text(b).slice(label.length + 1).trim() : '';
  };
  const id = { epigraph, island: thread('The Island'), instruments: thread('The Instruments of Progress') };
  if (!id.epigraph || !id.island || !id.instruments) throw new Error('fetchIdentity: epigraph or thread missing from the root page');
  _identity = id;
  return id;
}

// Fetches the full block content for a single item page.
export async function fetchItemContent(pageId: string): Promise<string> {
  const client = notionClient();
  const blocks = await fetchAllBlocks(client, pageId);
  return renderBlocks(blocks);
}

// Fetches a narrative page body and splits it into opening, one section per
// object (H3 = the object's exact name, then a 📍 callout), and the close
// (everything after the divider that ends the last section).
const _narrativeCache = new Map<string, NarrativeContent>();

export function splitNarrativeBlocks(blocks: any[]): NarrativeContent {
  const opening: any[] = [];
  const close: any[] = [];
  const sections: { names: string[]; place: any[]; body: any[] }[] = [];
  let phase: 'opening' | 'sections' | 'close' = 'opening';

  for (const block of blocks) {
    if (phase !== 'close' && block.type === 'heading_3') {
      const name = plainText(block.heading_3.rich_text).trim();
      const last = sections[sections.length - 1];
      // Consecutive H3s with nothing between them share one section.
      if (phase === 'sections' && last && !last.place.length && !last.body.length) last.names.push(name);
      else sections.push({ names: [name], place: [], body: [] });
      phase = 'sections';
      continue;
    }
    if (phase === 'opening') { opening.push(block); continue; }
    if (phase === 'close') { close.push(block); continue; }
    if (block.type === 'divider') { phase = 'close'; continue; }
    const cur = sections[sections.length - 1];
    if (block.type === 'callout' && !cur.place.length && !cur.body.length) cur.place.push(block);
    else cur.body.push(block);
  }

  return {
    openingHtml: renderBlocks(opening),
    sections: sections.map((s): NarrativeSection => ({
      names: s.names,
      placeHtml: s.place.map((b) => renderSpans(b.callout?.rich_text ?? [])).join(''),
      html: renderBlocks(s.body),
    })),
    closeHtml: renderBlocks(close),
  };
}

export async function fetchNarrativeContent(pageId: string): Promise<NarrativeContent> {
  const cached = _narrativeCache.get(pageId);
  if (cached) return cached;
  const client = notionClient();
  const content = splitNarrativeBlocks(await fetchAllBlocks(client, pageId));
  _narrativeCache.set(pageId, content);
  return content;
}

// Build-time cache so getStaticPaths and individual page renders share one fetch.
let _cache: SiteData | null = null;

export async function getSiteData(): Promise<SiteData> {
  if (_cache) return _cache;
  _cache = await fetchSiteData();
  return _cache;
}
