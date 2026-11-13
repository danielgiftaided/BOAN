import { test, expect } from '@playwright/test';
import { readFile, access } from 'node:fs/promises';

async function fillEnquiry(page) {
  await page.getByLabel('Your name', { exact: true }).fill('Test Visitor');
  await page.getByLabel('Email address', { exact: true }).fill('visitor@example.com');
  await page.getByLabel('Your message', { exact: true }).fill('I would like to ask about Pilates & Zumba.');
}

test('static contact markup is detectable by Netlify and works without JavaScript', async ({ browser }) => {
  const html = await readFile('dist/contact-us.html', 'utf8');
  expect(html).toContain('data-netlify="true"');
  expect(html).toContain('netlify-honeypot="bot-field"');
  expect(html).toMatch(/name="form-name"\s+value="boan-contact"/);
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/contact-us.html');
  await expect(page.locator('#contact-form')).toHaveAttribute('method', 'POST');
  await expect(page.locator('#contact-form')).toHaveAttribute('name', 'boan-contact');
  await expect(page.getByRole('link', { name: 'hello@boan.uk', exact: true })).toHaveAttribute('href', 'mailto:hello@boan.uk');
  await expect(page.locator('[name="bot-field"]')).toBeHidden();
  await fillEnquiry(page);
  const submitted = page.waitForRequest(request => request.method() === 'POST');
  await page.route('**/contact-us.html', route => route.request().method() === 'POST'
    ? route.fulfill({ contentType: 'text/html', body: '<h1>Submission accepted by test endpoint</h1>' })
    : route.continue());
  await page.getByRole('button', { name: 'Send message', exact: true }).click();
  const body = new URLSearchParams((await submitted).postData());
  expect(body.get('form-name')).toBe('boan-contact');
  expect(body.get('email')).toBe('visitor@example.com');
  expect(body.get('message')).toBe('I would like to ask about Pilates & Zumba.');
  await context.close();
});

test('contact validates, posts encoded fields, prevents duplicate sends and confirms only after acceptance', async ({ page }) => {
  const submissions = [];
  let release;
  const pending = new Promise(resolve => { release = resolve; });
  await page.route('**/*', async route => {
    if (route.request().method() !== 'POST') return route.continue();
    submissions.push(route.request());
    await pending;
    await route.fulfill({ status: 200, body: 'Accepted' });
  });
  await page.goto('/contact-us.html?topic=movement');
  const submit = page.getByRole('button', { name: 'Send message', exact: true });
  await submit.click();
  expect(submissions).toHaveLength(0);
  expect(await page.getByLabel('Your name', { exact: true }).evaluate(input => input.validity.valueMissing)).toBe(true);
  await fillEnquiry(page);
  await submit.click();
  await expect(page.locator('#contact-form button')).toBeDisabled();
  await expect(page.locator('#contact-form')).toHaveAttribute('aria-busy', 'true');
  await expect(page.locator('#contact-result')).toHaveText('Sending your message…');
  await page.locator('#contact-form').evaluate(form => form.requestSubmit());
  await expect.poll(() => submissions.length).toBe(1);
  const body = new URLSearchParams(submissions[0].postData());
  expect(body.get('form-name')).toBe('boan-contact');
  expect(body.get('name')).toBe('Test Visitor');
  expect(body.get('email')).toBe('visitor@example.com');
  expect(body.get('topic')).toBe('movement');
  expect(body.get('message')).toBe('I would like to ask about Pilates & Zumba.');
  expect(body.get('bot-field')).toBe('');
  expect(submissions[0].headers()['content-type']).toBe('application/x-www-form-urlencoded');
  release();
  await expect(page.locator('#contact-result')).toHaveText('Thank you — your message has been received. We’ll be in touch.');
  await expect(page.getByLabel('Your message', { exact: true })).toBeEmpty();
  await expect(submit).toBeEnabled();
});

test('failed contact submissions preserve the message and allow a retry', async ({ page }) => {
  let attempts = 0;
  await page.route('**/*', route => {
    if (route.request().method() !== 'POST') return route.continue();
    attempts += 1;
    return attempts === 1 ? route.fulfill({ status: 503 }) : route.fulfill({ status: 200, body: 'Accepted' });
  });
  await page.goto('/contact-us.html');
  await fillEnquiry(page);
  const submit = page.getByRole('button', { name: 'Send message', exact: true });
  await submit.click();
  await expect(page.locator('#contact-result')).toContainText('We couldn’t confirm your message was received');
  await expect(page.locator('#contact-result')).toContainText('hello@boan.uk');
  await expect(page.getByLabel('Your message', { exact: true })).toHaveValue('I would like to ask about Pilates & Zumba.');
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(page.locator('#contact-result')).toContainText('your message has been received');
  expect(attempts).toBe(2);
});

test('production and preview exports omit giving and retain temporary redirects for old links', async ({ request }) => {
  for (const file of ['index.html', 'about-us.html', 'our-programs.html', 'get-involved.html', 'contact-us.html']) {
    for (const directory of ['dist', 'docs/preview']) {
      const html = await readFile(`${directory}/${file}`, 'utf8');
      expect(html.includes('support-our-work.html'), `${directory}/${file} links to giving`).toBe(false);
      expect(/<form\b[^>]*id="donation-form"/.test(html), `${directory}/${file} contains a donation form`).toBe(false);
      expect(html.includes('£35'), `${directory}/${file} promotes a monthly gift`).toBe(false);
    }
  }
  await expect(access('dist/support-our-work.html')).rejects.toThrow();
  await expect(access('docs/preview/support-our-work.html')).rejects.toThrow();
  const redirects = await readFile('dist/_redirects', 'utf8');
  for (const path of ['/support-our-work.html', '/support-our-work', '/support-our-work/']) {
    expect(redirects).toContain(`${path}  `);
  }
  expect(redirects).toContain('/contact-us.html?topic=support  302!');
  expect((await request.get('/_redirects')).status()).toBe(200);
});

test('every public page uses the original logo favicon, which renders in pink and green', async ({ page }) => {
  for (const file of ['index.html', 'about-us.html', 'our-programs.html', 'get-involved.html', 'contact-us.html']) {
    await page.goto('/' + file);
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', './favicon.svg');
  }
  const pixels = await page.evaluate(async () => {
    const image = new Image();
    image.src = document.querySelector('link[rel="icon"]').href;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 400;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    const data = context.getImageData(0, 0, 400, 400).data;
    let green = 0;
    let pink = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] === 119 && data[i + 1] === 210 && data[i + 2] === 0) green++;
      if (data[i] === 255 && data[i + 1] === 102 && data[i + 2] === 196) pink++;
    }
    return { green, pink };
  });
  expect(pixels.green).toBeGreaterThan(10000);
  expect(pixels.pink).toBeGreaterThan(100);
});
