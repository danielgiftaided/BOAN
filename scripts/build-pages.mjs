import { writeFile } from 'node:fs/promises';
import { pages, renderPage } from '../src/site-content.mjs';
for (const page of pages) await writeFile(new URL(`../${page.file}`, import.meta.url), renderPage(page));
console.log(`Generated ${pages.length} dedicated BOAN pages.`);
