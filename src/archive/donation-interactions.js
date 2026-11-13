// Restore only after connecting a payment processor and publishing the giving page.
import { donationPresets, getMonthlyImpact } from '../content/donation-options.js';

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

