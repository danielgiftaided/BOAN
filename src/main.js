import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/dm-sans/700.css';
import '@fontsource/playfair-display/500-italic.css';
const dialog = document.querySelector('#join-dialog');
const interest = document.querySelector('select');
document.querySelectorAll('[data-join], [data-interest]').forEach(button => button.addEventListener('click', () => {
  interest.value = button.dataset.interest || 'A little bit of everything';
  document.querySelector('#form-result').textContent = '';
  dialog.showModal();
}));
document.querySelector('.close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog && (event.clientX < dialog.getBoundingClientRect().left || event.clientX > dialog.getBoundingClientRect().right || event.clientY < dialog.getBoundingClientRect().top || event.clientY > dialog.getBoundingClientRect().bottom)) dialog.close(); });
const menu = document.querySelector('.menu-toggle');
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); document.querySelector('nav').classList.toggle('open', open); });
document.querySelectorAll('nav a').forEach(a => a.addEventListener('click', () => { menu.setAttribute('aria-expanded', 'false'); document.querySelector('nav').classList.remove('open'); }));
document.querySelector('#interest-form').addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(event.target);
  const blob = new Blob([`BOAN — Builders Of A Nation\n\nName: ${data.get('name')}\nInterest: ${data.get('interest')}\n\nThis is a personal note of interest, not a confirmed registration.\n`], { type: 'text/plain' });
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'my-boan-interest.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  document.querySelector('#form-result').textContent = 'Your interest note is ready to download. Nothing has been sent online.';
});
document.querySelector('#year').textContent = new Date().getFullYear();

const programmeLinks = document.querySelectorAll('a[href="#movement"], a[href="#nutrition"], a[href="#workshops"], a[href="#retreats"]');
function highlightProgramme(id) {
  document.querySelectorAll('.card').forEach(card => card.classList.toggle('selected-programme', card.id === id));
  document.querySelectorAll('.offering-select').forEach(link => link.closest('.offering').classList.toggle('active', link.dataset.pillar === id));
  document.querySelector('.immersive-hero').dataset.focus = id;
}
programmeLinks.forEach(link => link.addEventListener('click', () => {
  const id = link.hash.slice(1);
  highlightProgramme(id);
  document.getElementById(id)?.focus({ preventScroll: true });
}));
window.addEventListener('hashchange', () => highlightProgramme(location.hash.slice(1)));
if (location.hash) highlightProgramme(location.hash.slice(1));
