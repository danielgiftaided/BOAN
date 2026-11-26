import { test, expect } from '@playwright/test';
import { healthQuestionnaire as source } from '../src/content/health-questionnaire.js';
import { createQuestionnaireState, needsFollowups, questionnaireSteps, clearInapplicableAnswers, guidanceFor, validateQuestionnaireStep } from '../src/health-questionnaire-state.js';

const answer = (page, key, value) => page.locator(`input[name="${key}"][value="${value}"]`).check();
const next = page => page.getByRole('button', { name: 'Next', exact: true }).click();
const back = page => page.getByRole('button', { name: 'Back', exact: true }).click();

async function start(page, name = 'Preview Participant') {
  await page.goto('/join-community.html');
  await page.locator('.community-intro').getByRole('link', { name: 'Register Your Interest', exact: true }).click();
  await expect(page).toHaveURL(/health-questionnaire.html$/);
  await page.locator('#hq-name').fill(name);
  await page.locator('#hq-email').fill('preview@example.com');
  await next(page);
  await expect(page.getByRole('heading', { name: 'Your general health', exact: true })).toBeVisible();
}

async function allGeneralNo(page) {
  for (let i = 1; i <= 7; i++) await answer(page, `G${i}`, 'NO');
}

async function signAndReview(page) {
  await page.locator('#hq-signature').fill('Preview Participant');
  await page.locator('#hq-acknowledged').check();
  await page.getByRole('button', { name: 'Review answers', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Review your answers', exact: true })).toBeVisible();
}

test('PAR-Q+ data retains 48 clinical questions, notes and both declarations', () => {
  expect(source.general).toHaveLength(7);
  expect(source.conditions).toHaveLength(10);
  expect(source.conditions.map(condition => condition.questions.length)).toEqual([3, 2, 4, 2, 5, 2, 4, 3, 3, 3]);
  expect(source.general[2].note).toContain('over-breathing');
  expect(source.general[5].note).toContain('does not limit your current ability');
  expect(source.conditions[3].questions[1].text).toContain('160/90 mmHg');
  expect(source.conditions[3].questions[1].note).toBe('(Answer YES if you do not know your resting blood pressure)');
  expect(source.declarations.general).toContain('maximum of 12 months');
  expect(source.declarations.followup).toContain('becomes invalid if my condition changes');
  expect(source.sourceNotices.join(' ')).toContain('You must use the entire questionnaire and NO changes are permitted.');
});

test('changing a branch removes hidden medical answers and changes the subsequent route', () => {
  const state = createQuestionnaireState();
  state.answers = { G1: 'YES', 'G1-details': ['Heart condition'], F1: 'YES', F1a: 'YES', F1b: 'NO', F1c: 'NO' };
  expect(needsFollowups(state)).toBe(true);
  expect(questionnaireSteps(state)).toHaveLength(14);
  expect(guidanceFor(state).join(' ')).toContain('You should seek further information');
  state.answers.F1 = 'NO';
  clearInapplicableAnswers(state);
  expect(state.answers.F1a).toBeUndefined();
  expect(guidanceFor(state).join(' ')).not.toContain('You should seek further information');
  state.answers.G1 = 'NO';
  clearInapplicableAnswers(state);
  expect(state.answers.F1).toBeUndefined();
  expect(state.answers['G1-details']).toBeUndefined();
  expect(questionnaireSteps(state)).toEqual(['details', 'general', 'declaration', 'review']);
  state.step = 'general';
  expect(Object.keys(validateQuestionnaireStep(state))).toHaveLength(6);
});

test('only the first community registration control opens the branded preview', async ({ page }) => {
  await page.goto('/join-community.html');
  await expect(page.locator('.community-first-step').getByRole('button', { name: 'Register Your Interest', exact: true })).toBeDisabled();
  await page.locator('.community-intro').getByRole('link', { name: 'Register Your Interest', exact: true }).click();
  await expect(page.locator('.hq-preview-notice')).toContainText('Responses are not sent to BOAN or saved');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');
  await next(page);
  await expect(page.locator('#hq-errors')).toBeFocused();
  await expect(page.locator('#hq-errors')).toContainText('Enter your name.');
  await expect(page.locator('#hq-errors')).toContainText('Enter a valid email address.');
});

test('all-NO answers skip medical screens, validate the declaration and finish without sending or saving', async ({ page }) => {
  const posts = [];
  page.on('request', request => { if (request.method() === 'POST') posts.push(request.url()); });
  await start(page);
  await next(page);
  await expect(page.locator('#hq-errors li')).toHaveCount(7);
  await allGeneralNo(page);
  await next(page);
  await expect(page.getByRole('heading', { name: 'Participant declaration', exact: true })).toBeVisible();
  await expect(page.locator('input[name="F1"]')).toHaveCount(0);
  await expect(page.locator('.hq-guidance')).toContainText('You do not need to complete Pages 2 and 3.');
  await page.getByRole('button', { name: 'Review answers', exact: true }).click();
  await expect(page.locator('#hq-errors')).toContainText('Type your name');
  await signAndReview(page);
  await expect(page.locator('.hq-review-group')).toHaveCount(1);
  await page.getByRole('button', { name: 'Finish preview', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Preview complete', exact: true })).toBeVisible();
  await expect(page.locator('.hq-complete')).toContainText('No questionnaire has been sent to BOAN.');
  await expect(page.locator('#hq-step')).not.toContainText('preview@example.com');
  expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
  expect(posts).toEqual([]);
  await page.getByRole('button', { name: 'Try another route', exact: true }).click();
  await expect(page.locator('#hq-name')).toHaveValue('');
  await expect(page.locator('#hq-email')).toHaveValue('');
});

test('YES answers reveal only the applicable medical follow-ups and retain the referral guidance', async ({ page }) => {
  test.setTimeout(60000);
  await start(page);
  await allGeneralNo(page);
  await answer(page, 'G1', 'YES');
  await next(page);
  await expect(page.locator('#hq-errors')).toContainText('provide these details');
  await page.locator('input[name="G1-details"][value="High blood pressure"]').check();
  await next(page);
  for (const condition of source.conditions) {
    await expect(page.locator(`input[name="${condition.id}"]`)).toHaveCount(2);
    await expect(page.locator(`input[name="${condition.questions[0].id}"]`)).toHaveCount(0);
    await answer(page, condition.id, 'YES');
    await next(page);
    await expect(page.locator('#hq-errors li')).toHaveCount(condition.questions.length + (condition.detail ? 1 : 0));
    for (const question of condition.questions) await answer(page, question.id, question.id === 'F4b' ? 'YES' : 'NO');
    if (condition.id === 'F4') {
      await expect(page.locator('#hq-F4b')).toContainText('Answer YES if you do not know your resting blood pressure');
      await expect(page.locator('#hq-F4b')).toHaveAttribute('aria-describedby', 'hq-F4b-note');
    }
    if (condition.detail) await page.locator(`[name="${condition.detail.id}"]`).fill('Sample condition and medication details for preview.');
    await next(page);
  }
  await expect(page.getByRole('heading', { name: 'Participant declaration', exact: true })).toBeVisible();
  await expect(page.locator('.hq-guidance')).toContainText('You should seek further information before becoming more physically active');
  await signAndReview(page);
  await expect(page.locator('.hq-review-group')).toHaveCount(11);
  await expect(page.locator('#hq-step')).toContainText('Sample condition and medication details for preview.');
});

test('Back navigation preserves answers and changing to NO drops the previous medical path', async ({ page }) => {
  await start(page);
  await allGeneralNo(page);
  await answer(page, 'G1', 'YES');
  await page.locator('input[name="G1-details"][value="Heart condition"]').check();
  await next(page);
  await answer(page, 'F1', 'YES');
  await answer(page, 'F1a', 'YES');
  await answer(page, 'F1b', 'NO');
  await answer(page, 'F1c', 'NO');
  await next(page);
  await back(page);
  await expect(page.locator('input[name="F1a"][value="YES"]')).toBeChecked();
  await answer(page, 'F1', 'NO');
  await expect(page.locator('input[name="F1a"]')).toHaveCount(0);
  await back(page);
  await expect(page.locator('input[name="G1"][value="YES"]')).toBeChecked();
  await answer(page, 'G1', 'NO');
  await expect(page.locator('input[name="G1-details"]')).toHaveCount(0);
  await next(page);
  await expect(page.getByRole('heading', { name: 'Participant declaration', exact: true })).toBeVisible();
  await expect(page.locator('.hq-guidance')).not.toContainText('You should seek further information');
  await signAndReview(page);
  await expect(page.locator('.hq-review-group')).toHaveCount(1);
});

test('guardian acknowledgement is conditional and cleared when no longer needed', async ({ page }) => {
  await start(page);
  await allGeneralNo(page);
  await next(page);
  await page.locator('#hq-signature').fill('Preview Participant');
  await page.locator('#hq-acknowledged').check();
  await page.locator('#hq-needsGuardian').check();
  await page.getByRole('button', { name: 'Review answers', exact: true }).click();
  await expect(page.locator('#hq-errors')).toContainText('parent, guardian or care provider’s typed name');
  await page.locator('#hq-guardianSignature').fill('Sample Guardian');
  await page.getByRole('button', { name: 'Review answers', exact: true }).click();
  await expect(page.locator('#hq-step')).toContainText('Sample Guardian');
  await back(page);
  await page.locator('#hq-needsGuardian').uncheck();
  await expect(page.locator('#hq-guardianSignature')).toHaveCount(0);
  await page.getByRole('button', { name: 'Review answers', exact: true }).click();
  await expect(page.locator('#hq-step')).not.toContainText('Sample Guardian');
});

test('sample text remains text in the review, including on a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await start(page, '<img src=x onerror="window.hqInjected=true">');
  await allGeneralNo(page);
  await next(page);
  await signAndReview(page);
  await expect(page.locator('#hq-step')).toContainText('<img src=x onerror="window.hqInjected=true">');
  await expect(page.locator('#hq-step img')).toHaveCount(0);
  expect(await page.evaluate(() => window.hqInjected)).toBeUndefined();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
