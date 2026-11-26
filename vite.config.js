import { defineConfig } from 'vite';
import { resolve } from 'node:path';
const names = ['index', 'about-us', 'our-programs', 'join-community', 'get-involved', 'contact-us', 'support-our-work', 'privacy-policy', 'health-questionnaire'];
export default defineConfig({
  base: './',
  build: { rollupOptions: { input: Object.fromEntries(names.map(name => [name, resolve(import.meta.dirname, `${name}.html`)])) } },
});
