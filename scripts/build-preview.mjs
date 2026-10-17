import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

// Package the actual production build, including its imagery and fonts, as one
// offline document. No server, package installation or internet access needed.
const root = resolve(import.meta.dirname, '..');
const types = { png: 'image/png', svg: 'image/svg+xml', woff: 'font/woff', woff2: 'font/woff2' };
async function dataUrl(asset) {
  const file = resolve(root, 'dist', asset.replace(/^\.\//, '').replace(/^\//, ''));
  if (!file.startsWith(resolve(root, 'dist') + '/')) throw new Error('Asset outside dist');
  const extension = file.split('.').pop();
  return `data:${types[extension] || 'application/octet-stream'};base64,${(await readFile(file)).toString('base64')}`;
}
let html = await readFile(resolve(root, 'dist/index.html'), 'utf8');
const stylesheet = html.match(/<link\b[^>]*rel="stylesheet"[^>]*>/);
if (!stylesheet) throw new Error('Missing production stylesheet');
let css = await readFile(resolve(root, 'dist', stylesheet[0].match(/href="([^"]+)"/)[1].replace(/^\//, '')), 'utf8');
for (const [match, asset] of [...css.matchAll(/url\(["']?([^\s"')]+)["']?\)/g)]) {
  if (!asset.startsWith('data:')) css = css.replace(match, `url("${await dataUrl(asset)}")`);
}
html = html.replace(stylesheet[0], () => `<style>${css}</style>`);
const moduleScript = html.match(/<script\b[^>]*type="module"[^>]*src="([^"]+)"[^>]*><\/script>/);
if (!moduleScript) throw new Error('Missing production script');
const js = await readFile(resolve(root, 'dist', moduleScript[1].replace(/^\//, '')), 'utf8');
html = html.replace(moduleScript[0], () => `<script type="module">${js.replace(/<\/script/gi, '<\\/script')}</script>`);
for (const [match, asset] of [...html.matchAll(/src="(\/[^\"]+)"/g)]) {
  html = html.replace(match, `src="${await dataUrl(asset)}"`);
}
await mkdir(resolve(root, 'docs'), { recursive: true });
await writeFile(resolve(root, 'docs/boan-interactive-preview.html'), html);
console.log('Created docs/boan-interactive-preview.html — open it in a browser.');
