import { test, expect } from '@playwright/test';

test('each homepage programme image links to its exact section without a duplicate text link', async ({ page }) => {
  for (const id of ['movement', 'workshops', 'creative', 'retreats']) {
    await page.goto('/');
    const card = page.locator(`.programme-card.${id}`);
    await expect(card.locator('a')).toHaveCount(1);
    await expect(card.locator('.text-link')).toHaveCount(0);
    const imageLink = card.getByRole('link', { name: `Explore ${id}`, exact: true });
    await expect(imageLink).toHaveAttribute('href', `our-programs.html#${id}`);
    await expect(imageLink.locator('.card-art')).toBeVisible();
    await expect(imageLink.locator('img')).toHaveAttribute('src', `./images/programme-${id}.png`);
    await imageLink.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new RegExp(`our-programs.html#${id}$`));
    await expect(page.locator(`#${id}`)).toBeInViewport();
    await expect(page.locator(`.program-jumps a[href="#${id}"]`)).toHaveAttribute('aria-current', 'location');
  }
});

test('supplied homepage and programme artwork loads completely without cropping on mobile and desktop', async ({ page }) => {
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    await expect(page.locator('.empowerment-hero img')).toHaveAttribute('alt', 'Together, we rise.');
    await expect(page.locator('.belonging-art img')).toHaveAttribute('alt', 'You belong here.');
    await expect(page.locator('.art-note, .art-arch, .rising-shapes')).toHaveCount(0);
    const images = page.locator('.empowerment-hero img, .programme-card img, .belonging-art img');
    await expect(images).toHaveCount(6);
    for (const image of await images.all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate(node => node.complete && node.naturalWidth > 0)).toBe(true);
      await expect(image).toHaveCSS('object-fit', 'contain');
      const ratio = await image.evaluate(node => {
        const box = node.getBoundingClientRect();
        return { actual: box.width / box.height, original: node.naturalWidth / node.naturalHeight };
      });
      expect(ratio.actual).toBeCloseTo(ratio.original, 2);
    }
    await page.goto('/our-programs.html');
    await expect(page.locator('.program-detail img')).toHaveCount(4);
    for (const id of ['movement', 'workshops', 'creative', 'retreats']) {
      const image = page.locator(`#${id} img`);
      await expect(image).toHaveAttribute('src', `./images/programme-${id}.png`);
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate(node => node.complete && node.naturalWidth > 0)).toBe(true);
      await expect(image).toHaveCSS('object-fit', 'contain');
      const ratio = await image.evaluate(node => {
        const box = node.getBoundingClientRect();
        return { actual: box.width / box.height, original: node.naturalWidth / node.naturalHeight };
      });
      expect(ratio.actual).toBeCloseTo(ratio.original, 2);
    }
  }
});

test('community page retains supplied joining information and non-linked interest buttons', async ({ page }) => {
  await page.goto('/join-community.html');
  await expect(page.getByRole('heading', { level: 1, name: 'Your wellbeing starts here.', exact: true })).toBeVisible();
  await expect(page.locator('.community-intro-copy')).toContainText('Perhaps you want to feel stronger, try something new or simply have time for yourself.');
  await expect(page.locator('.community-intro-copy')).toContainText('with a focus on making these opportunities accessible to women facing barriers.');
  await expect(page.locator('.community-programme-list li')).toHaveCount(4);
  await expect(page.locator('.community-barriers')).toContainText('Financial support will be means-tested, subject to eligibility and available funding.');
  await expect(page.locator('.community-welcome')).toContainText('Our initial focus is on women in Hackney.');
  await expect(page.locator('.community-steps li')).toHaveCount(3);
  await expect(page.locator('.community-first-step')).toContainText('Registering your interest does not guarantee a place or funding');
  const interest = page.getByRole('button', { name: 'Register Your Interest', exact: true });
  await expect(interest).toHaveCount(2);
  for (const button of await interest.all()) {
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute('type', 'button');
  }
  await expect(page.locator('a').filter({ hasText: 'Register Your Interest' })).toHaveCount(0);
  await expect(page.locator('form')).toHaveCount(0);
  await expect(page.locator('.community-faq details')).toHaveCount(6);
  await page.locator('.community-faq summary').filter({ hasText: 'Will my financial circumstances stay private?' }).click();
  await expect(page.locator('.community-faq details[open]')).toContainText('Your financial circumstances will not be shared with donors.');
  await page.locator('.community-faq summary').filter({ hasText: 'What happens if nothing suitable is available yet?' }).click();
  await expect(page.locator('.community-faq')).toContainText('With your permission, we’ll keep your details');
  await page.getByRole('link', { name: 'Talk to Us', exact: true }).click();
  await expect(page).toHaveURL(/contact-us.html$/);
});

test('community navigation works at the expanded mobile-menu breakpoint and closes on desktop', async ({ page }) => {
  for (const width of [390, 1024, 1200]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    const menu = page.getByRole('button', { name: 'Open menu', exact: true });
    await expect(menu).toBeVisible();
    await menu.click();
    await page.locator('#main-nav').getByRole('link', { name: 'Join our community', exact: true }).click();
    await expect(page).toHaveURL(/join-community.html$/);
    await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded', 'false');
    await page.getByRole('button', { name: 'Open menu', exact: true }).click();
    await page.setViewportSize({ width: 1440, height: 1000 });
    await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#main-nav').getByRole('link', { name: 'Join our community', exact: true })).toBeVisible();
    await expect(page.locator('.menu-toggle')).toBeHidden();
  }
});
