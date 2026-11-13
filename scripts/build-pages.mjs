import { writeFile, rm } from 'node:fs/promises';
import { pages, renderPage } from '../src/site-content.mjs';
// Avoid accidentally serving the old giving page during development.
await rm(new URL('../support-our-work.html', import.meta.url), { force: true });
for (const page of pages) await writeFile(new URL(`../${page.file}`, import.meta.url), renderPage(page));
console.log(`Generated ${pages.length} dedicated BOAN pages.`);
