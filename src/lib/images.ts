import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import sharp from 'sharp';

const IMAGES_DIR = path.join(process.cwd(), 'public', 'images');

export function ensureImagesDir(): void {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

/**
 * Download, EXIF-rotate, and save an image.
 * Returns the final filename (with content hash) so the caller can build the URL.
 * Using a content hash in the filename means any image replacement automatically
 * produces a new URL — busting every cache layer (CDN, browser) without manual purging.
 */
async function download(url: string, prefix: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = Buffer.from(await res.arrayBuffer());

    // Auto-rotate pixels to match EXIF orientation, output as JPEG.
    const processed = await sharp(raw).rotate().jpeg({ quality: 88 }).toBuffer();

    // 8-char content hash → new image = new filename = cache bust everywhere.
    const hash = crypto.createHash('md5').update(processed).digest('hex').slice(0, 8);
    const filename = `${prefix}-${hash}.jpg`;

    fs.writeFileSync(path.join(IMAGES_DIR, filename), processed);
    return `/images/${filename}`;
  } catch (e) {
    console.warn(`[meridian] Could not download image: ${url}`, e);
    return null;
  }
}

function extractUrl(file: any): string | null {
  if (!file) return null;
  if (file.type === 'file') return file.file?.url ?? null;
  if (file.type === 'external') return file.external?.url ?? null;
  return null;
}

export async function downloadPrimary(
  slug: string,
  files: any[]
): Promise<string | null> {
  if (!files?.length) return null;
  const url = extractUrl(files[0]);
  if (!url) return null;
  return download(url, `${slug}-primary`);
}

export async function downloadGallery(
  slug: string,
  files: any[]
): Promise<string[]> {
  if (!files?.length) return [];
  const paths: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const url = extractUrl(files[i]);
    if (!url) continue;
    const result = await download(url, `${slug}-gallery-${i}`);
    if (result) paths.push(result);
  }
  return paths;
}

export async function downloadCategoryImage(
  slug: string,
  files: any[]
): Promise<string | null> {
  if (!files?.length) return null;
  const url = extractUrl(files[0]);
  if (!url) return null;
  return download(url, `category-${slug}`);
}

/**
 * Responsive candidates for a downloaded image (07-responsive.md, Images): JPEGs
 * 480, 800, 1200, 1800 and 2600 px wide (only those narrower than the original),
 * written next to it in public/images on first use, plus the original at its own
 * width.
 */
export const SRCSET_WIDTHS = [480, 800, 1200, 1800, 2600];
type Variants = { srcset: string; width: number; height: number };
const made = new Map<string, Promise<Variants | undefined>>();

function variants(src: string | null | undefined): Promise<Variants | undefined> {
  if (!src || !src.startsWith('/images/') || !src.endsWith('.jpg')) return Promise.resolve(undefined);
  let v = made.get(src);
  if (!v) {
    v = makeVariants(src);
    made.set(src, v);
  }
  return v;
}

async function makeVariants(src: string): Promise<Variants | undefined> {
  const file = path.join(IMAGES_DIR, path.basename(src));
  try {
    const { width, height } = await sharp(file).metadata();
    if (!width || !height) return undefined;
    const base = path.basename(src, '.jpg');
    const out: string[] = [];
    for (const w of SRCSET_WIDTHS) {
      if (w >= width) break;
      const name = `${base}-w${w}.jpg`;
      const dest = path.join(IMAGES_DIR, name);
      if (!fs.existsSync(dest)) await sharp(file).resize({ width: w }).jpeg({ quality: 82, mozjpeg: true }).toFile(dest);
      out.push(`/images/${name} ${w}w`);
    }
    out.push(`${src} ${width}w`);
    return { srcset: out.join(', '), width, height };
  } catch (e) {
    console.warn(`[meridian] Could not make sizes for ${src}`, e);
    return undefined;
  }
}

/**
 * srcset and sizes for an <img>. `sizes` lists [media condition, box width] pairs,
 * the last without a condition. When the box crops the image with object-fit:
 * cover, `cover` is the box's width ÷ height: an image wider than the box is drawn
 * wider than it, so its sizes grow by the same factor.
 */
export async function responsive(
  src: string | null | undefined,
  sizes: [string | null, string][],
  cover?: number
): Promise<{ srcset?: string; sizes?: string }> {
  const v = await variants(src);
  if (!v) return {};
  const k = cover ? Math.max(1, v.width / v.height / cover) : 1;
  const len = (l: string) => (k > 1.01 ? `calc(${l} * ${k.toFixed(2)})` : l);
  return { srcset: v.srcset, sizes: sizes.map(([q, l]) => (q ? `${q} ${len(l)}` : len(l))).join(', ') };
}
