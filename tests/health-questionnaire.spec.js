import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { buildHealthSubmission, HEALTH_FORM_NAME } from '../src/health-questionnaire-submission.js';
import { healthQuestionnaire as source } from '../src/content/health-questionnaire.js';
import { HEALTH_CONSENT_TEXT, createQuestionnaireState, needsFollowups, questionnaireSteps, clearInapplicableAnswers, guidanceFor, validateQuestionnaireStep } from '../src/health-questionnaire-state.js';

const answer = (page, key, value) => page.locator(`input[name="${key}"][value="${value}"]`).check();
const next = page => page.getByRole('button', { name: 'Next', exact: true }).click();
const back = page => page.getByRole('button', { name: 'Back', exact: true }).click();

async function start(page, name = 'Preview Participant', origin = '') {
  await page.goto(origin + '/join-community.html');
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

test('only the first community registration control opens the questionnaire without preview or about boxes', async ({ page }) => {
  await page.goto('/join-community.html');
  await expect(page.locator('.community-first-step').getByRole('button', { name: 'Register Your Interest', exact: true })).toBeDisabled();
  await page.locator('.community-intro').getByRole('link', { name: 'Register Your Interest', exact: true }).click();
  await expect(page.locator('.hq-preview-notice, .hq-source')).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText('Interactive preview');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');
  await next(page);
  await expect(page.locator('#hq-errors')).toBeFocused();
  await expect(page.locator('#hq-errors')).toContainText('Enter your name.');
  await expect(page.locator('#hq-errors')).toContainText('Enter a valid email address.');
});

test('all-NO answers skip medical screens; local previews require consent but never send or save', async ({ page }) => {
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
  await expect(page.locator('#hq-errors')).toContainText('Type your full name');
  await signAndReview(page);
  await expect(page.locator('.hq-review-group')).toHaveCount(1);
  await page.getByRole('button', { name: 'Send questionnaire', exact: true }).click();
  await expect(page.locator('#hq-errors')).toContainText('Please give your consent');
  await page.locator('#hq-healthConsent').check();
  await page.getByRole('button', { name: 'Send questionnaire', exact: true }).click();
  await expect(page.locator('#hq-submission-result')).toContainText('This preview cannot send questionnaires');
  await expect(page.locator('#hq-step')).toContainText('preview@example.com');
  expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
  expect(posts).toEqual([]);
  await back(page);
  await back(page);
  await back(page);
  await expect(page.locator('#hq-name')).toHaveValue('Preview Participant');
  await expect(page.locator('#hq-email')).toHaveValue('preview@example.com');
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

// Serve the built app under its production origin without making any external
// requests. All POSTs are intercepted; these tests never submit real forms.
async function productionSite(page, request, handlePost, origin = 'https://www.boan.uk') {
  await page.route(origin + '/**', async route => {
    if (route.request().method() === 'POST') return handlePost(route);
    const url = new URL(route.request().url());
    const response = await request.get('http://127.0.0.1:4178' + url.pathname + url.search);
    return route.fulfill({ response });
  });
}

test('Netlify detects the health form schema and submitted reports exclude abandoned branches', async () => {
  const html = await readFile('dist/health-questionnaire.html', 'utf8');
  expect(html).toContain('name="boan-health-questionnaire" method="POST" data-netlify="true" netlify-honeypot="bot-field" hidden');
  for (const field of ['form-name', 'bot-field', 'name', 'email', 'questionnaire-results', 'health-consent']) expect(html).toContain(`name="${field}"`);
  const state = createQuestionnaireState();
  state.details = { name: ' Sample Participant ', email: ' sample@example.com ', interests: ['Movement', 'Creative'], support: 'Sample & support' };
  state.answers = Object.fromEntries(source.general.map(q => [q.id, 'NO']));
  state.answers.F1 = 'YES'; // Stale answers must not leak into the final report.
  state.answers.F1a = 'YES';
  state.answers['G1-details'] = ['Heart condition'];
  state.declaration = { ...state.declaration, signature: 'Sample Participant', witness: '', needsGuardian: false, guardianSignature: 'STALE GUARDIAN', acknowledged: true, healthConsent: true };
  let body = buildHealthSubmission(state);
  expect(body.get('form-name')).toBe(HEALTH_FORM_NAME);
  expect(body.get('name')).toBe('Sample Participant');
  expect(body.get('email')).toBe('sample@example.com');
  expect(body.get('bot-field')).toBe('');
  expect(body.get('health-consent')).toBe(HEALTH_CONSENT_TEXT);
  let report = body.get('questionnaire-results');
  for (const q of source.general) expect(report).toContain(q.text);
  expect(report).toContain(source.declarations.general);
  expect(report).toContain('Movement, Creative');
  expect(report).not.toContain('MEDICAL FOLLOW-UPS');
  expect(report).not.toContain('STALE GUARDIAN');
  state.answers.G1 = 'YES';
  state.answers['G1-details'] = ['High blood pressure'];
  for (const condition of source.conditions) {
    state.answers[condition.id] = 'YES';
    for (const q of condition.questions) state.answers[q.id] = 'NO';
  }
  state.answers['F10-details'] = 'Sample medication';
  state.declaration.needsGuardian = true;
  state.declaration.guardianSignature = 'Sample Guardian';
  report = buildHealthSubmission(state).get('questionnaire-results');
  for (const condition of source.conditions) {
    expect(report).toContain(condition.gate.text);
    for (const q of condition.questions) expect(report).toContain(q.text);
  }
  expect(report).toContain(source.declarations.followup);
  expect(report).toContain('Sample Guardian');
  state.answers.F1 = 'NO';
  expect(buildHealthSubmission(state).get('questionnaire-results')).not.toContain('F1a: ');
});

test('production sends the whole applicable questionnaire once, requires consent and clears only after acceptance', async ({ page, request }) => {
  const posts = [];
  let release;
  const pending = new Promise(resolve => { release = resolve; });
  await productionSite(page, request, async route => {
    posts.push(route.request());
    await pending;
    await route.fulfill({ status: 200, body: 'Accepted' });
  });
  await start(page, 'Sample Participant', 'https://www.boan.uk');
  await allGeneralNo(page);
  await next(page);
  await signAndReview(page);
  const send = page.getByRole('button', { name: 'Send questionnaire', exact: true });
  await expect(page.locator('#hq-healthConsent')).not.toBeChecked();
  await send.click();
  await expect(page.locator('#hq-errors')).toContainText('Please give your consent');
  expect(posts).toHaveLength(0);
  await page.locator('#hq-healthConsent').check();
  // Any subsequent edit invalidates consent.
  await back(page);
  await page.locator('#hq-signature').fill('Sample Participant');
  await page.getByRole('button', { name: 'Review answers', exact: true }).click();
  await expect(page.locator('#hq-healthConsent')).not.toBeChecked();
  await page.locator('#hq-healthConsent').check();
  await send.click();
  await expect(page.locator('#hq-next')).toBeDisabled();
  await expect(page.locator('#hq-back')).toBeDisabled();
  await expect(page.locator('#health-questionnaire-form')).toHaveAttribute('aria-busy', 'true');
  await expect(page.locator('#hq-submission-result')).toHaveText('Sending your questionnaire…');
  await expect(page.locator('#hq-step')).toContainText('preview@example.com');
  await page.locator('#health-questionnaire-form').evaluate(form => form.requestSubmit());
  await expect.poll(() => posts.length).toBe(1);
  const body = new URLSearchParams(posts[0].postData());
  expect(posts[0].url()).toBe('https://www.boan.uk/');
  expect(posts[0].headers()['content-type']).toBe('application/x-www-form-urlencoded');
  expect(body.get('form-name')).toBe('boan-health-questionnaire');
  expect(body.get('name')).toBe('Sample Participant');
  expect(body.get('email')).toBe('preview@example.com');
  expect(body.get('health-consent')).toBe(HEALTH_CONSENT_TEXT);
  expect(body.get('questionnaire-results')).toContain(source.general[0].text);
  expect(body.get('questionnaire-results')).toContain('Typed acknowledgement: Sample Participant');
  expect(body.get('questionnaire-results')).not.toContain('MEDICAL FOLLOW-UPS');
  release();
  await expect(page.getByRole('heading', { name: 'Thank you for taking the first step.', exact: true })).toBeVisible();
  await expect(page.locator('.hq-complete')).toContainText('Your questionnaire has been received');
  await expect(page.locator('#hq-step')).not.toContainText('preview@example.com');
  expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
});

test('production submission errors preserve answers and consent for a successful retry', async ({ page, request }) => {
  const attempts = [];
  await productionSite(page, request, route => {
    attempts.push(route.request().postData());
    return route.fulfill({ status: attempts.length === 1 ? 503 : 200, body: 'Test endpoint' });
  });
  await start(page, 'Sample Participant', 'https://www.boan.uk');
  await allGeneralNo(page);
  await next(page);
  await signAndReview(page);
  await page.locator('#hq-healthConsent').check();
  const send = page.getByRole('button', { name: 'Send questionnaire', exact: true });
  await send.click();
  await expect(page.locator('#hq-submission-result')).toContainText('We couldn’t confirm your questionnaire was received');
  await expect(page.locator('#hq-step')).toContainText('preview@example.com');
  await expect(page.locator('#hq-healthConsent')).toBeChecked();
  await expect(send).toBeEnabled();
  await expect(page.locator('#health-questionnaire-form')).not.toHaveAttribute('aria-busy', 'true');
  await send.click();
  await expect(page.locator('.hq-complete')).toContainText('Your questionnaire has been received');
  expect(attempts).toHaveLength(2);
  expect(attempts[0]).toBe(attempts[1]);
});

test('Deploy Previews block sending even when reached through a production-like HTTPS page', async ({ page, request }) => {
  const posts = [];
  const origin = 'https://deploy-preview-999--gregarious-praline-4653bf.netlify.app';
  await productionSite(page, request, route => {
    posts.push(route.request().url());
    return route.fulfill({ status: 500 });
  }, origin);
  await start(page, 'Sample Participant', origin);
  await allGeneralNo(page);
  await next(page);
  await signAndReview(page);
  await page.locator('#hq-healthConsent').check();
  await page.getByRole('button', { name: 'Send questionnaire', exact: true }).click();
  await expect(page.locator('#hq-submission-result')).toContainText('Your answers have not been sent or saved');
  expect(posts).toHaveLength(0);
});
