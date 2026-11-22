import { test, expect } from '@playwright/test';

test('testimonials automatically cycle through all four stories, wrap and allow pause/play', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  const rotation = page.locator('[data-testimonial-rotation]');
  const active = page.locator('[data-testimonial-slide]:visible');
  await expect(rotation).toHaveText('Pause testimonials');
  await expect(page.locator('.testimonial-status')).toHaveAttribute('aria-live', 'off');
  await page.evaluate(() => document.fonts.ready);
  const initialHeight = await page.locator('.testimonial-slides').evaluate(node => node.getBoundingClientRect().height);
  await page.clock.runFor(8000);
  await expect(active.locator('figcaption')).toHaveText('Mary J');
  await page.clock.runFor(8000);
  await expect(active.locator('figcaption')).toHaveText('Amina Potts');
  await page.clock.runFor(8000);
  await expect(active.locator('figcaption')).toHaveText("Nicola O'Connor (Instructor)");
  expect(await page.locator('.testimonial-slides').evaluate(node => node.getBoundingClientRect().height)).toBeCloseTo(initialHeight, 1);
  await page.clock.runFor(8000);
  await expect(active.locator('figcaption')).toHaveText('Gemma Jermaine');
  await rotation.focus();
  await rotation.press('Enter');
  await expect(rotation).toHaveText('Play testimonials');
  await expect(page.locator('.testimonial-status')).toHaveAttribute('aria-live', 'polite');
  await page.clock.runFor(24000);
  await expect(active.locator('figcaption')).toHaveText('Gemma Jermaine');
  await rotation.press('Enter');
  await page.clock.runFor(8000);
  await expect(active.locator('figcaption')).toHaveText('Mary J');
});

test('hover temporarily pauses rotation and keyboard/manual interaction keeps it paused until play', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  const carousel = page.locator('[data-testimonial-carousel]');
  const active = page.locator('[data-testimonial-slide]:visible');
  const rotation = page.locator('[data-testimonial-rotation]');
  await carousel.hover();
  await page.clock.runFor(16000);
  await expect(active.locator('figcaption')).toHaveText('Gemma Jermaine');
  await page.mouse.move(0, 0);
  await page.clock.runFor(8000);
  await expect(active.locator('figcaption')).toHaveText('Mary J');
  const next = page.getByRole('button', { name: 'Next testimonial', exact: true });
  await next.focus();
  await expect(rotation).toHaveText('Play testimonials');
  await page.clock.runFor(16000);
  await expect(active.locator('figcaption')).toHaveText('Mary J');
  await next.press('Enter');
  await expect(active.locator('figcaption')).toHaveText('Amina Potts');
  await page.clock.runFor(16000);
  await expect(active.locator('figcaption')).toHaveText('Amina Potts');
  await rotation.focus();
  await rotation.press('Enter');
  await page.clock.runFor(8000);
  await expect(active.locator('figcaption')).toHaveText("Nicola O'Connor (Instructor)");
});

test('reduced-motion preference starts paused and still permits explicit play', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install();
  await page.goto('/');
  const rotation = page.locator('[data-testimonial-rotation]');
  const active = page.locator('[data-testimonial-slide]:visible');
  await expect(rotation).toHaveText('Play testimonials');
  await page.clock.runFor(16000);
  await expect(active.locator('figcaption')).toHaveText('Gemma Jermaine');
  await rotation.focus();
  await rotation.press('Enter');
  await page.clock.runFor(8000);
  await expect(active.locator('figcaption')).toHaveText('Mary J');
});

test('enabling reduced motion stops an already playing carousel', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  const rotation = page.locator('[data-testimonial-rotation]');
  await expect(rotation).toHaveText('Pause testimonials');
  await page.clock.runFor(8000);
  await expect(page.locator('[data-testimonial-slide]:visible figcaption')).toHaveText('Mary J');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(rotation).toHaveText('Play testimonials');
  await page.clock.runFor(16000);
  await expect(page.locator('[data-testimonial-slide]:visible figcaption')).toHaveText('Mary J');
});
