import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Astro copies public/ → dist/ before getStaticPaths runs, so images
// downloaded at build time into public/images/ never make it into dist/.
// This integration syncs them across after the build completes.
const syncImages = {
  name: 'sync-item-images',
  hooks: {
    'astro:build:done': () => {
      const src = path.join(process.cwd(), 'public', 'images');
      const dest = path.join(process.cwd(), 'dist', 'images');
      if (!fs.existsSync(src)) return;
      fs.mkdirSync(dest, { recursive: true });
      for (const file of fs.readdirSync(src)) {
        fs.copyFileSync(path.join(src, file), path.join(dest, file));
      }
    },
  },
};

export default defineConfig({
  site: 'https://meridian.yulan.me',
  output: 'static',
  // Each page's CSS is a few kB: inline it rather than block first paint on extra requests.
  build: { inlineStylesheets: 'always' },
  // /search is followed but not indexed, so it stays out of the sitemap.
  integrations: [sitemap({ filter: (page) => !/\/search\/$/.test(page) }), syncImages],
});
