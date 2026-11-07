import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const links = [['About Us', 'about-us.html'], ['Our Programs', 'our-programs.html'], ['Get Involved', 'get-involved.html'], ['Contact Us', 'contact-us.html']];
const files = ['index.html', ...links.map(([, file]) => file), 'support-our-work.html'];

test('header links open distinct, reloadable pages with current-page state', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.site-header nav a')).toHaveCount(4);
  for (const [label, file] of links) {
    await page.locator('.site-header nav').getByRole('link', { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${file}$`));
    await page.reload();
    await expect(page.locator('.site-header nav').getByRole('link', { name: label, exact: true })).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('main h1')).toHaveCount(1);
  }
  await page.locator('.site-header').getByRole('link', { name: 'Support Our Work', exact: true }).click();
  await expect(page).toHaveURL(/support-our-work.html$/);
  await expect(page.getByRole('heading', { name: 'Choose your gift.' })).toBeVisible();
  await page.getByRole('link', { name: 'BOAN home', exact: true }).click();
  await expect(page).toHaveURL(/index.html$/);
});

test('programme links and involvement links reach their dedicated content and contact topic', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Explore movement', exact: true }).click();
  await expect(page).toHaveURL(/our-programs.html#movement$/);
  await expect(page.locator('#movement')).toBeVisible();
  await page.getByRole('link', { name: 'Ask about movement', exact: true }).click();
  await expect(page.locator('#contact-topic')).toHaveValue('movement');
  await page.goto('/get-involved.html');
  await page.getByRole('link', { name: 'Talk about volunteering' }).click();
  await expect(page.locator('#contact-topic')).toHaveValue('volunteering');
  await page.goto('/');
  await page.getByRole('link', { name: 'Explore creative', exact: true }).click();
  await expect(page).toHaveURL(/our-programs.html#creative$/);
  await page.getByRole('link', { name: 'Ask about creative', exact: true }).click();
  await expect(page.locator('#contact-topic')).toHaveValue('creative');
  await page.goto('/get-involved.html');
  await page.getByRole('link', { name: 'Ask about becoming an ambassador', exact: true }).click();
  await expect(page.locator('#contact-topic')).toHaveValue('ambassador');
});

test('monthly £35 default, review disclosure and single-gift change stay consistent', async ({ page }) => {
  await page.goto('/support-our-work.html');
  await expect(page.getByLabel('Monthly donation', { exact: true })).toBeChecked();
  await expect(page.locator('#gift-summary')).toHaveText('£35 every month');
  await expect(page.locator('#gift-impact')).toContainText('fitness classes for a month');
  await page.getByRole('button', { name: 'Review my support' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('#review-amount')).toHaveText('£35 every month');
  await expect(page.getByRole('dialog')).toContainText('No payment has been taken');
  await page.keyboard.press('Escape');
  await page.getByLabel('Single donation', { exact: true }).check();
  await expect(page.locator('#gift-summary')).toHaveText('£25 once');
  await page.getByLabel('£100', { exact: true }).check();
  await page.getByRole('button', { name: 'Review my support' }).click();
  await expect(page.locator('#review-amount')).toHaveText('£100 once');
  await expect(page.locator('#review-impact')).not.toContainText('fitness classes for a month');
  await page.getByRole('button', { name: 'Change my choice' }).click();
  await page.getByLabel('Monthly donation', { exact: true }).check();
  await expect(page.locator('#gift-summary')).toHaveText('£35 every month');
});

test('custom gift rejects invalid money, preserves pennies, and carries the right choice to contact', async ({ page }) => {
  await page.goto('/support-our-work.html');
  const custom = page.getByLabel('Or enter another amount (£)', { exact: true });
  for (const bad of ['', '0', '-5', '12.345', 'abc', '1e3']) {
    await custom.fill(bad || ' ');
    await page.getByRole('button', { name: 'Review my support' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.locator('#donation-error')).toContainText('at least £1');
  }
  await custom.fill('12.50');
  await expect(page.locator('#gift-summary')).toHaveText('£12.50 every month');
  await expect(page.locator('#preset-amounts input:checked')).toHaveCount(0);
  await page.getByRole('button', { name: 'Review my support' }).click();
  await expect(page.locator('#review-amount')).toHaveText('£12.50 every month');
  await page.getByRole('link', { name: 'Ask about giving' }).click();
  await expect(page.locator('#contact-topic')).toHaveValue('support');
  await expect(page.getByLabel('Your message', { exact: true })).toHaveValue('I’m interested in supporting BOAN with a monthly gift of £12.50.');
});

test('contact validates and saves a draft rather than reporting a sent enquiry', async ({ page }) => {
  await page.goto('/contact-us.html');
  await page.getByRole('button', { name: 'Save my enquiry' }).click();
  expect(await page.getByLabel('Your name', { exact: true }).evaluate(input => input.validity.valueMissing)).toBe(true);
  await expect(page.locator('#contact-result')).toBeEmpty();
  await page.getByLabel('Your name', { exact: true }).fill('Preview User');
  await page.getByLabel('Email address', { exact: true }).fill('preview@example.com');
  await page.getByLabel('Your message', { exact: true }).fill('I would like to ask about BOAN programmes.');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Save my enquiry' }).click();
  const download = await downloadPromise;
  const text = await readFile(await download.path(), 'utf8');
  expect(text).toContain('It has not been sent to BOAN.');
  expect(text).toContain('I would like to ask about BOAN programmes.');
  await expect(page.locator('#contact-result')).toContainText('not been sent to BOAN');
});

test('mobile menu closes on navigation and Escape; support remains prominent', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded', 'false');
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await page.locator('.site-header nav').getByRole('link', { name: 'About Us', exact: true }).click();
  await expect(page).toHaveURL(/about-us.html$/);
  await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('.site-header').getByRole('link', { name: 'Support Our Work', exact: true })).toBeVisible();
});

test('all pages fit narrow and wide screens, have no page errors and no broken local links', async ({ page, request }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const targets = new Set();
  for (const file of files) {
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('/' + file);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${file} overflows at ${width}`).toBe(true);
    }
    for (const href of await page.locator('a[href]').evaluateAll(anchors => anchors.map(a => a.getAttribute('href')))) {
      if (href.startsWith('#')) expect(await page.locator(href).count(), `${file}: missing ${href}`).toBe(1);
      else if (href.includes('.html')) targets.add(href.split(/[?#]/)[0]);
    }
  }
  for (const target of targets) expect((await request.get('/' + target)).status(), target).toBe(200);
  expect(errors).toEqual([]);
});

test('downloadable single-file mockup navigates all pages and donation choices offline', async ({ page, context }) => {
  const html = await readFile(resolve('docs/boan-interactive-preview.html'), 'utf8');
  const assetRequests = [];
  page.on('request', request => { if (request.resourceType() !== 'document' && /^https?:/.test(request.url())) assetRequests.push(request.url()); });
  await page.route('**/mockup.html', route => route.fulfill({ contentType: 'text/html', body: html }));
  await context.setOffline(true);
  await page.goto('/mockup.html');
  const site = page.frameLocator('#site');
  await expect(site.getByRole('heading', { name: 'Your space. Your strength. Our future.' })).toBeVisible();
  for (const [label, file] of links) {
    await site.locator('.site-header nav').getByRole('link', { name: label, exact: true }).click();
    await expect(site.locator('body')).toHaveAttribute('data-page', file);
  }
  await site.locator('.site-header').getByRole('link', { name: 'Support Our Work', exact: true }).click();
  await expect(site.locator('#gift-summary')).toHaveText('£35 every month');
  await site.getByRole('button', { name: 'Review my support' }).click();
  await site.getByRole('link', { name: 'Ask about giving' }).click();
  await expect(site.locator('#contact-topic')).toHaveValue('support');
  await expect(site.getByLabel('Your message', { exact: true })).toHaveValue('I’m interested in supporting BOAN with a monthly gift of £35.');
  await page.goBack();
  await expect(site.locator('body')).toHaveAttribute('data-page', 'support-our-work.html');
  expect(assetRequests).toEqual([]);
});


test('mobile giving shortcut reaches the donation choices below the sticky header', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/support-our-work.html');
  await page.getByRole('link', { name: 'Choose your gift', exact: true }).click();
  await expect(page).toHaveURL(/#donation-form$/);
  await expect(page.locator('#donation-form')).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Choose your gift.' })).toBeInViewport();
});
