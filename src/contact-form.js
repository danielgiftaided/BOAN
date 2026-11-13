const contact = document.querySelector('#contact-form');

if (contact) {
  const params = new URLSearchParams(window.BOAN_PREVIEW_SEARCH ?? location.search);
  const topic = contact.elements.topic;
  if ([...topic.options].some(option => option.value === params.get('topic'))) topic.value = params.get('topic');
  if (params.has('message')) contact.elements.message.value = params.get('message').slice(0, 5000);

  const result = document.querySelector('#contact-result');
  const submit = contact.querySelector('[type="submit"]');
  const submitLabel = submit.innerHTML;

  contact.addEventListener('submit', async event => {
    event.preventDefault();
    if (submit.disabled) return;

    if (window.BOAN_OFFLINE_PREVIEW || location.protocol === 'file:' || import.meta.env.DEV) {
      result.dataset.state = 'preview';
      result.textContent = 'This preview cannot send messages. Please email hello@boan.uk or use the form on www.boan.uk.';
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    const body = new URLSearchParams(new FormData(contact));
    submit.disabled = true;
    submit.textContent = 'Sending…';
    contact.setAttribute('aria-busy', 'true');
    result.dataset.state = 'pending';
    result.textContent = 'Sending your message…';

    try {
      // Netlify detects the matching named form in the generated static HTML.
      // The email field is also used by Netlify for the notification Reply-To.
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error('Form submission was not accepted');
      contact.reset();
      result.dataset.state = 'success';
      result.textContent = 'Thank you — your message has been received. We’ll be in touch.';
    } catch {
      // Keep all entered fields available for a retry or direct email.
      result.dataset.state = 'error';
      result.textContent = 'We couldn’t confirm your message was received. Please try again or email hello@boan.uk.';
    } finally {
      clearTimeout(timeout);
      submit.disabled = false;
      submit.innerHTML = submitLabel;
      contact.removeAttribute('aria-busy');
    }
  });
}
