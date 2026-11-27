import { healthQuestionnaire as source } from './content/health-questionnaire.js';

export const HEALTH_CONSENT_TEXT = 'I explicitly consent to BOAN using the health information in this questionnaire to assess and support my participation. I understand my answers will be stored in Netlify Forms and sent by email to hello@boan.uk for BOAN’s authorised team. I can withdraw my consent by contacting hello@boan.uk.';

export function createQuestionnaireState() {
  const today = new Date();
  const date = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
  return { step: 'details', details: { name: '', email: '', interests: [], support: '' }, answers: {}, declaration: { date, signature: '', witness: '', needsGuardian: false, guardianSignature: '', acknowledged: false, healthConsent: false } };
}

export function needsFollowups(state) {
  return source.general.some(question => state.answers[question.id] === 'YES');
}

export function questionnaireSteps(state) {
  return ['details', 'general', ...(needsFollowups(state) ? source.conditions.map(condition => condition.id) : []), 'declaration', 'review'];
}

export function clearInapplicableAnswers(state) {
  for (const question of source.general) {
    if (question.detail && state.answers[question.id] !== 'YES') delete state.answers[question.detail.id];
  }
  for (const condition of source.conditions) {
    if (!needsFollowups(state)) delete state.answers[condition.id];
    if (state.answers[condition.id] !== 'YES') {
      for (const question of condition.questions) delete state.answers[question.id];
      if (condition.detail) delete state.answers[condition.detail.id];
    }
  }
  if (!state.declaration.needsGuardian) state.declaration.guardianSignature = '';
}

export function guidanceFor(state) {
  if (!needsFollowups(state)) return source.generalAdvice;
  const hasFollowupYes = source.conditions.some(condition => state.answers[condition.id] === 'YES' && condition.questions.some(question => state.answers[question.id] === 'YES'));
  return [...(hasFollowupYes ? source.followupAdviceYes : source.followupAdviceNo), ...source.followupDelayAdvice];
}

export function currentClinicalQuestions(state) {
  if (state.step === 'general') return source.general;
  const condition = source.conditions.find(item => item.id === state.step);
  if (!condition) return [];
  return [condition.gate, ...(state.answers[condition.id] === 'YES' ? condition.questions : [])];
}

export function validateQuestionnaireStep(state) {
  const errors = {};
  if (state.step === 'details') {
    if (!state.details.name.trim()) errors.name = 'Enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.details.email.trim())) errors.email = 'Enter a valid email address.';
  } else if (state.step === 'declaration') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(state.declaration.date)) errors.date = 'Choose the date.';
    if (!state.declaration.signature.trim()) errors.signature = 'Type your full name to acknowledge the declaration.';
    if (!state.declaration.acknowledged) errors.acknowledged = 'Confirm you have read and understood the declaration.';
    if (state.declaration.needsGuardian && !state.declaration.guardianSignature.trim()) errors.guardianSignature = 'Enter the parent, guardian or care provider’s typed name.';
  } else if (state.step === 'review') {
    if (!state.declaration.healthConsent) errors.healthConsent = 'Please give your consent before sending your health information.';
  } else {
    for (const question of currentClinicalQuestions(state)) {
      if (!['YES', 'NO'].includes(state.answers[question.id])) errors[question.id] = 'Choose Yes or No.';
      if (question.detail && state.answers[question.id] === 'YES') {
        const value = state.answers[question.detail.id];
        if (question.detail.type === 'multiple' ? !Array.isArray(value) || !value.length : !String(value || '').trim()) errors[question.detail.id] = 'Please provide these details.';
      }
    }
    const condition = source.conditions.find(item => item.id === state.step);
    if (condition?.detail && state.answers[condition.id] === 'YES' && !String(state.answers[condition.detail.id] || '').trim()) errors[condition.detail.id] = 'Please list the conditions and related medications.';
  }
  return errors;
}
