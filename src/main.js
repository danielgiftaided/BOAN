import { donationPresets, getMonthlyImpact } from './content/donation-options.js';
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

function downloadText(filename, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const contact = document.querySelector('#contact-form');
if (contact) {
  const params = new URLSearchParams(window.BOAN_PREVIEW_SEARCH ?? location.search);
  const topic = contact.elements.topic;
  if ([...topic.options].some(option => option.value === params.get('topic'))) topic.value = params.get('topic');
  if (params.has('message')) contact.elements.message.value = params.get('message').slice(0, 5000);
  contact.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(contact);
    downloadText('my-boan-enquiry.txt', `BOAN — enquiry draft\n\nName: ${data.get('name')}\nEmail: ${data.get('email')}\nTopic: ${topic.selectedOptions[0].textContent}\n\n${data.get('message')}\n\nThis is a saved enquiry draft. It has not been sent to BOAN.\n`);
    document.querySelector('#contact-result').textContent = 'Your enquiry draft is ready to download. It has not been sent to BOAN.';
  });
}

const giving = document.querySelector('#donation-form');
if (giving) {
  const choices = { single: { amount: 2500, custom: false, raw: '' }, monthly: { amount: 3500, custom: false, raw: '' } };
  let frequency = 'monthly';
  const presetGroup = document.querySelector('#preset-amounts');
  const custom = document.querySelector('#custom-amount');
  const error = document.querySelector('#donation-error');
  const review = document.querySelector('#donation-review');
  const monthlyPanel = document.querySelector('#monthly-impact');
  function parseAmount(raw) {
    if (!/^\d+(?:\.\d{1,2})?$/.test(raw)) return null;
    const pence = Math.round(Number(raw) * 100);
    return Number.isSafeInteger(pence) && pence >= 100 ? pence : null;
  }
  function amount() {
    const choice = choices[frequency];
    return choice.custom ? parseAmount(choice.raw) : choice.amount;
  }
  function money(pence) {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: pence % 100 ? 2 : 0, maximumFractionDigits: 2 }).format(pence / 100);
  }
  function summary(pence) { return frequency === 'monthly' ? `${money(pence)} every month` : money(pence); }
  function impact(pence) {
    return frequency === 'monthly'
      ? getMonthlyImpact(pence).description
      : 'Help widen access to BOAN’s community activities with your single gift.';
  }
  function clearError() {
    error.textContent = '';
    custom.removeAttribute('aria-invalid');
  }
  function updateSummary() {
    const value = amount();
    document.querySelector('#gift-summary').textContent = value === null ? 'Choose your amount' : summary(value);
    document.querySelector('#gift-impact').textContent = value === null ? 'Enter an amount of at least £1, with up to two decimal places.' : impact(value);
    monthlyPanel.hidden = frequency !== 'monthly' || value === null;
    if (!monthlyPanel.hidden) {
      const selectedImpact = getMonthlyImpact(value);
      document.querySelector('#monthly-impact-amount').textContent = `${money(value)} a month.`;
      document.querySelector('#monthly-impact-title').textContent = selectedImpact.title;
      document.querySelector('#monthly-impact-description').textContent = selectedImpact.description;
    }
  }
  function renderAmounts() {
    const choice = choices[frequency];
    presetGroup.dataset.frequency = frequency;
    presetGroup.innerHTML = donationPresets[frequency].map(value => `<label><input type="radio" name="amount" value="${value}"${!choice.custom && choice.amount === value * 100 ? ' checked' : ''}/><span>£${value}</span></label>`).join('');
    custom.value = choice.custom ? choice.raw : '';
    document.querySelector('#amount-period').textContent = frequency === 'monthly' ? 'per month' : 'for your single gift';
    clearError();
    updateSummary();
  }
  giving.querySelectorAll('[name="frequency"]').forEach(radio => radio.addEventListener('change', () => {
    frequency = radio.value;
    renderAmounts();
  }));
  presetGroup.addEventListener('change', event => {
    if (event.target.name !== 'amount') return;
    choices[frequency] = { amount: Number(event.target.value) * 100, custom: false, raw: '' };
    custom.value = '';
    clearError();
    updateSummary();
  });
  custom.addEventListener('input', () => {
    choices[frequency].custom = true;
    choices[frequency].raw = custom.value.trim();
    presetGroup.querySelectorAll('input').forEach(radio => { radio.checked = false; });
    clearError();
    updateSummary();
  });
  giving.addEventListener('submit', event => {
    event.preventDefault();
    const value = amount();
    if (value === null) {
      error.textContent = 'Enter an amount of at least £1, with up to two decimal places.';
      custom.setAttribute('aria-invalid', 'true');
      custom.focus();
      return;
    }
    document.querySelector('#review-amount').textContent = summary(value);
    document.querySelector('#review-impact').textContent = impact(value);
    const params = new URLSearchParams({ topic: 'support', message: `I’m interested in supporting BOAN with a ${frequency === 'monthly' ? 'monthly' : 'single'} gift of ${money(value)}.` });
    document.querySelector('#giving-contact').href = `contact-us.html?${params}`;
    review.showModal();
  });
  review.querySelectorAll('[data-close-review]').forEach(button => button.addEventListener('click', () => review.close()));
  review.addEventListener('click', event => {
    const { left, right, top, bottom } = review.getBoundingClientRect();
    if (event.target === review && (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom)) review.close();
  });
  renderAmounts();
}
