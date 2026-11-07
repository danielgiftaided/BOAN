import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname, extname } from 'node:path';
import { pages } from '../src/site-content.mjs';

// Export real, individually navigable pages plus a single-file preview of the
// same pages. Both versions include their own fonts, artwork and JavaScript.
const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const types = { '.png': 'image/png', '.svg': 'image/svg+xml', '.woff': 'font/woff', '.woff2': 'font/woff2' };
function assetPath(asset, from) {
  const path = asset.startsWith('/') ? resolve(dist, asset.slice(1)) : resolve(dirname(from), asset);
  if (!path.startsWith(dist + '/')) throw new Error('Asset outside dist');
  return path;
}
async function dataUrl(asset, from) {
  const path = assetPath(asset, from);
  return `data:${types[extname(path)] || 'application/octet-stream'};base64,${(await readFile(path)).toString('base64')}`;
}
async function inlinePage(file) {
  const path = resolve(dist, file);
  let html = await readFile(path, 'utf8');
  const stylesheet = html.match(/<link\b[^>]*rel="stylesheet"[^>]*>/);
  if (!stylesheet) throw new Error(`Missing stylesheet in ${file}`);
  const cssPath = assetPath(stylesheet[0].match(/href="([^"]+)"/)[1], path);
  let css = await readFile(cssPath, 'utf8');
  for (const [match, asset] of [...css.matchAll(/url\(["']?([^\s"')]+)["']?\)/g)]) {
    if (!asset.startsWith('data:')) css = css.replace(match, `url("${await dataUrl(asset, cssPath)}")`);
  }
  html = html.replace(stylesheet[0], () => `<style>${css}</style>`);
  const script = html.match(/<script\b[^>]*type="module"[^>]*src="([^"]+)"[^>]*><\/script>/);
  if (!script) throw new Error(`Missing script in ${file}`);
  const js = await readFile(assetPath(script[1], path), 'utf8');
  if (/\bimport\s*[{"'*]/.test(js)) throw new Error('Preview requires a self-contained JavaScript bundle');
  html = html.replace(script[0], () => `<script type="module">${js.replace(/<\/script/gi, '<\\/script')}</script>`);
  for (const [match, asset] of [...html.matchAll(/src="([^"]+)"/g)]) {
    if (!asset.startsWith('data:')) html = html.replace(match, `src="${await dataUrl(asset, path)}"`);
  }
  return html.replace('</head>', '<meta name="robots" content="noindex,nofollow"/></head>');
}
await mkdir(resolve(root, 'docs/preview'), { recursive: true });
const documents = {};
for (const page of pages) {
  documents[page.file] = await inlinePage(page.file);
  await writeFile(resolve(root, 'docs/preview', page.file), documents[page.file]);
}
const source = JSON.stringify(documents).replaceAll('<', '\\u003c');
const single = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>BOAN — Interactive website mockup</title><style>html,body{margin:0;width:100%;height:100%;overflow:hidden}iframe{border:0;width:100%;height:100%;display:block}</style></head><body><iframe id="site" title="BOAN interactive website preview"></iframe><script>
const documents=${source};
const frame=document.getElementById('site');
let current='index.html';
const safeJSON=value=>JSON.stringify(value).replaceAll('<','\\u003c');
function render(path,push=false){
 const url=new URL(path,'https://preview.boan.invalid/');
 const file=url.pathname.split('/').pop()||'index.html';
 if(url.origin!=='https://preview.boan.invalid'||!documents[file])return;
 current=file+url.search+url.hash;
 const helper='<script>window.BOAN_PREVIEW_SEARCH='+safeJSON(url.search)+';window.BOAN_PREVIEW_HASH='+safeJSON(url.hash)+';document.addEventListener("click",function(event){const a=event.target.closest("a[href]");if(!a||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;const href=a.getAttribute("href");if(href.startsWith("#")){event.preventDefault();const target=document.getElementById(href.slice(1));if(target){target.scrollIntoView();target.focus({preventScroll:true});}window.BOAN_PREVIEW_HASH=href;dispatchEvent(new Event("hashchange"));}else if(/^[^:]*\\\\.html(?:[?#]|$)/.test(href)){event.preventDefault();parent.postMessage({type:"boan-preview-navigation",href:href},"*");}});document.addEventListener("DOMContentLoaded",function(){document.fonts.ready.then(function(){const target=document.getElementById(window.BOAN_PREVIEW_HASH.slice(1));if(target)target.scrollIntoView();});});<\\/script>';
 frame.srcdoc=documents[file].replace('</body>',helper+'</body>');
 if(push)history.pushState(null,'','#'+encodeURIComponent(current));
}
window.addEventListener('message',event=>{if(event.source===frame.contentWindow&&event.data?.type==='boan-preview-navigation'&&typeof event.data.href==='string')render(event.data.href,true)});
function restore(){try{render(decodeURIComponent(location.hash.slice(1))||'index.html')}catch{render('index.html')}}
window.addEventListener('popstate',restore);restore();
</script></body></html>`;
await writeFile(resolve(root, 'docs/boan-interactive-preview.html'), single);
console.log(`Exported ${pages.length} offline pages in docs/preview and one navigable HTML mockup.`);
