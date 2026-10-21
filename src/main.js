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
dialog.addEventListener('click', event => {
  const { left, right, top, bottom } = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom)) dialog.close();
});

const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
function closeMenu() {
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Open menu');
  nav.classList.remove('open');
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  nav.classList.toggle('open', open);
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menu.focus();
  }
});
matchMedia('(min-width: 821px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

function highlightProgramme(id) {
  document.querySelectorAll('.programme-card').forEach(card => card.classList.toggle('selected-programme', card.id === id));
  nav.querySelectorAll('a').forEach(link => {
    if (link.hash === `#${id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', () => {
  const id = link.hash.slice(1);
  highlightProgramme(id);
  if (id) document.getElementById(id)?.focus({ preventScroll: true });
}));
window.addEventListener('hashchange', () => highlightProgramme(location.hash.slice(1)));
if (location.hash) highlightProgramme(location.hash.slice(1));

document.querySelector('#interest-form').addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(event.target);
  const blob = new Blob([`BOAN — Builders Of A Nation\n\nName: ${data.get('name')}\nInterest: ${data.get('interest')}\n\nThis is a personal note of interest, not a confirmed registration.\n`], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'my-boan-interest.txt';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  document.querySelector('#form-result').textContent = 'Your interest note is ready to download. Nothing has been sent online.';
});
document.querySelector('#year').textContent = new Date().getFullYear();
