export interface Item {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  story: string;
  year: number | null;
  dateDetail: string;
  dateLabel: string; // short date for cards, star cards and narrative rows, e.g. c.1590
  era: string;
  categoryId: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  tags: string[];
  maker: string;
  originCountry: string;
  materials: string;
  dimensions: string;
  condition: string;
  provenance: string;
  verification: string;
  narrativeIds: string[];
  primaryImage: string | null;
  galleryImages: string[];
  galleryCaptions: string[]; // one per gallery image, in order (Notion: one per line)
  imageAltText: string;
  featured: boolean;
  displayOrder: number;
  publishStatus: string;
  itemId: number;
  thread: string; // 'The Island' | 'Instruments of Progress' | ''
  yearFrom: number | null; // start of the date range (timeline "passing through")
  yearTo: number | null; // end of the date range
  details: ItemDetail[]; // optional hotspots on the primary image
}

// One hand-placed point on the primary image. x and y are 0–1 fractions.
export interface ItemDetail {
  x: number;
  y: number;
  label: string;
  text: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  displayOrder: number;
  coverImage: string | null;
  publishStatus: string;
}

export interface Narrative {
  id: string;
  slug: string;
  name: string;
  premise: string;
  displayOrder: number;
  publishStatus: string;
  itemIds: string[]; // related item page ids (dashless)
}

// A narrative page body split at its H3s. Consecutive H3s with nothing between
// them share one section (e.g. England South / West / East).
export interface NarrativeSection {
  names: string[]; // exact item names from the H3s
  placeHtml: string; // the 📍 callout under the H3, e.g. "July · Balham, south London"
  html: string; // everything after the callout, up to the next H3 or divider
}

export interface NarrativeContent {
  openingHtml: string; // blocks before the first H3
  sections: NarrativeSection[];
  closeHtml: string; // blocks after the divider that ends the last section
}

export interface SiteData {
  items: Item[];
  categories: Category[];
  narratives: Narrative[];
  aboutHtml: string;
}

export const ERA_OPTIONS = [
  'Ancient',
  'Medieval',
  'Renaissance',
  'Elizabethan',
  'Stuart',
  'Georgian',
  'Regency',
  'Victorian',
  'Edwardian',
  'Interwar',
  'Mid-Century',
  'Late 20th C.',
] as const;

export const CONDITION_OPTIONS = [
  'Mint',
  'Excellent',
  'Good',
  'Fair',
  'Poor',
  'Restoration Needed',
] as const;

export const TAG_OPTIONS = [
  'Optical',
  'Writing',
  'Navigation',
  'Calculation',
  'Meteorology',
  'Photography',
  'Literature',
  'Cartography',
  'Horology',
  'Scientific',
  'Decorative',
] as const;

export const TIMELINE_SEGMENTS = [
  { label: 'pre-1500', from: -Infinity, to: 1499 },
  { label: '1500–1799', from: 1500, to: 1799 },
  { label: '1800–1899', from: 1800, to: 1899 },
  { label: '1900–1950', from: 1900, to: 1950 },
  { label: '1951–present', from: 1951, to: Infinity },
] as const;
