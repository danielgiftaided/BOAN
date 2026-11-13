import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { pages } from './src/site-content.mjs';
export default defineConfig({
  base: './',
  build: { rollupOptions: { input: Object.fromEntries(pages.map(page => [page.file.replace('.html', ''), resolve(import.meta.dirname, page.file)])) } },
});
