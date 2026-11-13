import './contact-form.js';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/dm-sans/700.css';
import '@fontsource/playfair-display/500-italic.css';

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
matchMedia('(min-width: 1001px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', () => {
  const target = document.getElementById(link.hash.slice(1));
  target?.focus({ preventScroll: true });
}));
function updateProgramLocation() {
  document.querySelectorAll('.program-jumps a').forEach(link => {
    if (link.hash === (window.BOAN_PREVIEW_HASH ?? location.hash)) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
window.addEventListener('hashchange', updateProgramLocation);
updateProgramLocation();
document.querySelector('#year').textContent = new Date().getFullYear();

const testimonialCarousel = document.querySelector('[data-testimonial-carousel]');
if (testimonialCarousel) {
  const slides = [...testimonialCarousel.querySelectorAll('[data-testimonial-slide]')];
  const dots = [...testimonialCarousel.querySelectorAll('[data-testimonial-index]')];
  const status = testimonialCarousel.querySelector('.testimonial-status');
  const stage = testimonialCarousel.querySelector('.testimonial-slides');
  let selected = 0;
  function showTestimonial(index) {
    selected = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.hidden = i !== selected; });
    dots.forEach((dot, i) => {
      if (i === selected) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    status.textContent = `${selected + 1} of ${slides.length} — ${slides[selected].dataset.author}`;
  }
  testimonialCarousel.querySelectorAll('[data-testimonial-step]').forEach(button => {
    button.addEventListener('click', () => showTestimonial(selected + Number(button.dataset.testimonialStep)));
  });
  dots.forEach(dot => dot.addEventListener('click', () => showTestimonial(Number(dot.dataset.testimonialIndex))));
  testimonialCarousel.querySelector('.testimonial-controls').addEventListener('keydown', event => {
    const destinations = { ArrowLeft: selected - 1, ArrowRight: selected + 1, Home: 0, End: slides.length - 1 };
    if (Object.hasOwn(destinations, event.key)) {
      event.preventDefault();
      showTestimonial(destinations[event.key]);
    }
  });
  let touchStart = null;
  stage.addEventListener('pointerdown', event => {
    touchStart = event.pointerType === 'touch' ? { x: event.clientX, y: event.clientY } : null;
  });
  stage.addEventListener('pointerup', event => {
    if (!touchStart || event.pointerType !== 'touch') return;
    const dx = event.clientX - touchStart.x;
    const dy = event.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy) * 1.5) showTestimonial(selected + (dx < 0 ? 1 : -1));
  });
  stage.addEventListener('pointercancel', () => { touchStart = null; });
}
