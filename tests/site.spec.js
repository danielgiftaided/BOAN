import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { testimonials } from '../src/content/testimonials.js';
const links = [['Home', 'index.html'], ['About Us', 'about-us.html'], ['Our Programs', 'our-programs.html'], ['Get Involved', 'get-involved.html'], ['Contact Us', 'contact-us.html']];
const files = links.map(([, file]) => file);

test('header links open distinct, reloadable pages with current-page state', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.site-header nav a')).toHaveCount(5);
  for (const [label, file] of links) {
    await page.locator('.site-header nav').getByRole('link', { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${file}$`));
    await page.reload();
    await expect(page.locator('.site-header nav').getByRole('link', { name: label, exact: true })).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('main h1')).toHaveCount(1);
  }
  await expect(page.getByRole('link', { name: 'Support Our Work', exact: true })).toHaveCount(0);
  await page.locator('.site-header nav').getByRole('link', { name: 'Home', exact: true }).click();
  await expect(page.locator('.site-header nav').getByRole('link', { name: 'Home', exact: true })).toHaveAttribute('aria-current', 'page');
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

test('mobile menu closes on navigation and Escape while donation links are paused', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded', 'false');
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await page.locator('.site-header nav').getByRole('link', { name: 'About Us', exact: true }).click();
  await expect(page).toHaveURL(/about-us.html$/);
  await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('a[href*="support-our-work"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await page.locator('.site-header nav').getByRole('link', { name: 'Home', exact: true }).click();
  await expect(page).toHaveURL(/index.html$/);
  await expect(page.getByRole('heading', { name: 'Feel supported. Grow stronger. Thrive together.', exact: true })).toBeVisible();
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
      if (file === 'index.html') {
        const widths = await page.locator('#hero-title').evaluate(heading => ({
          available: heading.getBoundingClientRect().width,
          lines: [...heading.querySelectorAll('.hero-line')].map(line => line.getBoundingClientRect().width),
        }));
        expect(widths.lines).toHaveLength(3);
        for (const lineWidth of widths.lines) expect(lineWidth, `Headline clips at ${width}px`).toBeLessThanOrEqual(widths.available + 1);
      }
    }
    await expect(page.locator('.hero-reassurance, .eyebrow, .card-number, .art-caption, .art-overline, .art-bottom, .announcement, .brand-name')).toHaveCount(0);
    for (const selector of ['.site-header .brand-mark', '.footer-top .brand-mark']) {
      const background = await page.locator(selector).evaluate(element => getComputedStyle(element).backgroundImage);
      expect(background).toContain('rgb(119, 210, 0)');
      expect(background).toContain('rgb(255, 102, 196)');
    }
    for (const href of await page.locator('a[href]').evaluateAll(anchors => anchors.map(a => a.getAttribute('href')))) {
      if (href.startsWith('#')) expect(await page.locator(href).count(), `${file}: missing ${href}`).toBe(1);
      else if (href.includes('.html')) targets.add(href.split(/[?#]/)[0]);
    }
  }
  for (const target of targets) expect((await request.get('/' + target)).status(), target).toBe(200);
  expect(errors).toEqual([]);
});

test('downloadable single-file mockup navigates public pages and never sends contact messages', async ({ page, context }) => {
  const html = await readFile(resolve('docs/boan-interactive-preview.html'), 'utf8');
  const assetRequests = [];
  page.on('request', request => { if (request.resourceType() !== 'document' && /^https?:/.test(request.url())) assetRequests.push(request.url()); });
  await page.route('**/mockup.html', route => route.fulfill({ contentType: 'text/html', body: html }));
  await context.setOffline(true);
  await page.goto('/mockup.html');
  const site = page.frameLocator('#site');
  await expect(site.getByRole('heading', { name: 'Feel supported. Grow stronger. Thrive together.' })).toBeVisible();
  await site.getByRole('button', { name: 'Next testimonial', exact: true }).click();
  await expect(site.locator('#testimonial-slide-2 figcaption')).toHaveText('Mary J');
  await expect(site.locator('#testimonial-slide-2')).toBeVisible();
  for (const [label, file] of links) {
    await site.locator('.site-header nav').getByRole('link', { name: label, exact: true }).click();
    await expect(site.locator('body')).toHaveAttribute('data-page', file);
  }
  await expect(site.locator('a[href*="support-our-work"]')).toHaveCount(0);
  await site.getByLabel('Your name', { exact: true }).fill('Preview User');
  await site.getByLabel('Email address', { exact: true }).fill('preview@example.com');
  await site.getByLabel('Your message', { exact: true }).fill('This is only an offline preview.');
  await site.getByRole('button', { name: 'Send message', exact: true }).click();
  await expect(site.locator('#contact-result')).toContainText('This preview cannot send messages');
  await expect(site.getByLabel('Your message', { exact: true })).toHaveValue('This is only an offline preview.');
  await page.goBack();
  await expect(site.locator('body')).toHaveAttribute('data-page', 'get-involved.html');
  expect(assetRequests).toEqual([]);
});


test('homepage shows short verbatim testimonials in brand-coloured cards with accessible controls', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.empowerment-hero .hero-actions')).toHaveCount(0);
  await expect(page.locator('.empowerment-hero a, .empowerment-hero button')).toHaveCount(0);
  await expect(page.locator('.journeys')).toHaveCount(0);
  const structure = await page.locator('main').evaluate(main => [...main.children].map(section => section.classList[0]));
  expect(structure[0]).toBe('empowerment-hero');
  expect(structure[1]).toBe('testimonials');
  expect(structure).not.toContain('support-feature');
  expect(structure.indexOf('faq')).toBe(structure.indexOf('belonging') + 1);
  const first = page.locator('#testimonial-slide-1');
  const second = page.locator('#testimonial-slide-2');
  await expect(first).toBeVisible();
  await expect(second).not.toBeVisible();
  for (const quote of testimonials) {
    expect(quote.paragraphs.join(' ')).toContain(quote.excerpt);
    expect(quote.excerpt.split(/\s+/).length).toBeLessThan(40);
  }
  await expect(first.locator('blockquote p')).toHaveCount(1);
  await expect(first.locator('blockquote')).toHaveText('I feel so much better within myself, and it’s become such a positive part of my life.');
  await expect(first).toHaveCSS('background-color', 'rgb(255, 102, 196)');
  await expect(first.locator('figcaption')).toHaveText('Gemma Jermaine');
  const next = page.getByRole('button', { name: 'Next testimonial', exact: true });
  await next.click();
  await expect(first).not.toBeVisible();
  await expect(second).toBeVisible();
  await expect(second.locator('blockquote p')).toHaveCount(1);
  await expect(second.locator('blockquote')).toHaveText('I’ve noticed a massive difference not only in my core strength and balance, but in my general physical and mental health too.');
  await expect(second).toHaveCSS('background-color', 'rgb(119, 210, 0)');
  await expect(second.locator('figcaption')).toHaveText('Mary J');
  await expect(page.locator('.testimonial-status')).toHaveText('2 of 2 — Mary J');
  await next.click();
  await expect(first).toBeVisible();
  await page.getByRole('button', { name: 'Previous testimonial', exact: true }).click();
  await expect(second).toBeVisible();
  await next.focus();
  await next.press('ArrowLeft');
  await expect(first).toBeVisible();
  await next.press('End');
  await expect(second).toBeVisible();
  await next.press('Home');
  await expect(first).toBeVisible();
  await page.getByRole('button', { name: 'Read testimonial from Mary J', exact: true }).click();
  await expect(second).toBeVisible();
  await expect(page.locator('.testimonial-dot[aria-current="true"]')).toHaveCount(1);
  await page.getByRole('button', { name: 'Read testimonial from Gemma Jermaine', exact: true }).click();
  await expect(first).toBeVisible();
});

test('testimonials support mobile buttons and horizontal swipes while leaving vertical gestures alone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Next testimonial', exact: true }).click();
  await expect(page.locator('#testimonial-slide-2')).toBeVisible();
  const stage = page.locator('.testimonial-slides');
  await stage.dispatchEvent('pointerdown', { pointerType: 'touch', clientX: 300, clientY: 200 });
  await stage.dispatchEvent('pointerup', { pointerType: 'touch', clientX: 100, clientY: 210 });
  await expect(page.locator('#testimonial-slide-1')).toBeVisible();
  await stage.dispatchEvent('pointerdown', { pointerType: 'touch', clientX: 180, clientY: 100 });
  await stage.dispatchEvent('pointerup', { pointerType: 'touch', clientX: 170, clientY: 300 });
  await expect(page.locator('#testimonial-slide-1')).toBeVisible();
  await stage.dispatchEvent('pointerdown', { pointerType: 'touch', clientX: 100, clientY: 200 });
  await stage.dispatchEvent('pointerup', { pointerType: 'touch', clientX: 300, clientY: 205 });
  await expect(page.locator('#testimonial-slide-2')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
