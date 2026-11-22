import { test, expect } from '@playwright/test';

test('testimonials cycle every five seconds and wrap without Play/Pause controls', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  const active = page.locator('[data-testimonial-slide]:visible');
  await expect(page.getByRole('button', { name: /^(Play|Pause) testimonials$/ })).toHaveCount(0);
  await expect(page.locator('[data-testimonial-rotation]')).toHaveCount(0);
  await expect(page.locator('.testimonial-status')).toHaveAttribute('aria-live', 'off');
  await page.evaluate(() => document.fonts.ready);
  const initialHeight = await page.locator('.testimonial-slides').evaluate(node => node.getBoundingClientRect().height);
  for (const author of ['Mary J', 'Amina Potts', "Nicola O'Connor (Instructor)", 'Gemma Jermaine']) {
    await page.clock.runFor(5000);
    await expect(active.locator('figcaption')).toHaveText(author);
    expect(await page.locator('.testimonial-slides').evaluate(node => node.getBoundingClientRect().height)).toBeCloseTo(initialHeight, 1);
  }
});

test('hover, focus and manual navigation keep the carousel cycling with a fresh five-second interval', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  const active = page.locator('[data-testimonial-slide]:visible');
  await page.locator('[data-testimonial-carousel]').hover();
  await page.clock.runFor(5000);
  await expect(active.locator('figcaption')).toHaveText('Mary J');
  const next = page.getByRole('button', { name: 'Next testimonial', exact: true });
  await next.focus();
  await page.clock.runFor(5000);
  await expect(active.locator('figcaption')).toHaveText('Amina Potts');
  await page.getByRole('button', { name: 'Read testimonial from Gemma Jermaine', exact: true }).click();
  await page.clock.runFor(3000);
  await expect(active.locator('figcaption')).toHaveText('Gemma Jermaine');
  await next.focus();
  await next.press('Enter');
  await expect(active.locator('figcaption')).toHaveText('Mary J');
  await expect(page.locator('.testimonial-status')).toHaveAttribute('aria-live', 'polite');
  await page.clock.runFor(3000);
  await expect(active.locator('figcaption')).toHaveText('Mary J');
  await page.clock.runFor(2000);
  await expect(active.locator('figcaption')).toHaveText('Amina Potts');
  await expect(page.locator('.testimonial-status')).toHaveAttribute('aria-live', 'off');
});

test('reduced-motion preferences stop and automatically resume rotation when cleared', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install();
  await page.goto('/');
  const active = page.locator('[data-testimonial-slide]:visible');
  const status = page.locator('.testimonial-status');
  await expect(status).toHaveAttribute('aria-live', 'polite');
  await page.clock.runFor(15000);
  await expect(active.locator('figcaption')).toHaveText('Gemma Jermaine');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(status).toHaveAttribute('aria-live', 'off');
  await page.clock.runFor(5000);
  await expect(active.locator('figcaption')).toHaveText('Mary J');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(status).toHaveAttribute('aria-live', 'polite');
  await page.clock.runFor(15000);
  await expect(active.locator('figcaption')).toHaveText('Mary J');
});

test('a hidden tab suspends rotation and returning starts a fresh five-second interval', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  const active = page.locator('[data-testimonial-slide]:visible');
  await page.clock.runFor(5000);
  await expect(active.locator('figcaption')).toHaveText('Mary J');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.clock.runFor(20000);
  await expect(active.locator('figcaption')).toHaveText('Mary J');
  await page.evaluate(() => {
    delete document.hidden;
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.clock.runFor(5000);
  await expect(active.locator('figcaption')).toHaveText('Amina Potts');
});
