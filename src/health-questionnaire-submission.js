import { healthQuestionnaire as source } from './content/health-questionnaire.js';
import { HEALTH_CONSENT_TEXT, needsFollowups, guidanceFor } from './health-questionnaire-state.js';

export const HEALTH_FORM_NAME = 'boan-health-questionnaire';
const display = value => Array.isArray(value) ? value.join(', ') || 'Not provided' : value === 'YES' ? 'Yes' : value === 'NO' ? 'No' : String(value || 'Not provided');

// Build from the active route, rather than the currently visible step or every
// state key, so notification emails contain the full applicable questionnaire
// and never retain medical answers from an abandoned branch.
export function buildHealthSubmission(state, honeypot = '') {
  const lines = [
    'BOAN — Registration and health questionnaire', source.title,
    'PAR-Q+ © 2025 PAR-Q+ Collaboration; source date 01-11-2024.', '',
    `Name: ${state.details.name.trim()}`, `Email: ${state.details.email.trim()}`,
    `Programme interests: ${display(state.details.interests)}`,
    `What would help participation: ${display(state.details.support)}`, '',
    'GENERAL HEALTH',
  ];
  const addQuestion = question => {
    lines.push(`${question.id}: ${question.text}`, `Answer: ${display(state.answers[question.id])}`);
    if (question.note) lines.push(question.note);
    if (question.detail && state.answers[question.id] === 'YES') lines.push(question.detail.text, display(state.answers[question.detail.id]));
    lines.push('');
  };
  source.general.forEach(addQuestion);
  if (needsFollowups(state)) {
    lines.push('MEDICAL FOLLOW-UPS', '');
    for (const condition of source.conditions) {
      lines.push(condition.title);
      addQuestion(condition.gate);
      if (state.answers[condition.id] === 'YES') {
        condition.questions.forEach(addQuestion);
        if (condition.detail) lines.push(condition.detail.text, display(state.answers[condition.detail.id]), '');
      }
    }
  }
  lines.push('GUIDANCE SHOWN TO PARTICIPANT', ...guidanceFor(state), '',
    'PARTICIPANT DECLARATION', needsFollowups(state) ? source.declarations.followup : source.declarations.general,
    source.guardianNote, '', `Date: ${state.declaration.date}`,
    `Typed acknowledgement: ${state.declaration.signature}`,
    `Witness: ${display(state.declaration.witness)}`,
    `Parent, guardian or care provider also required: ${state.declaration.needsGuardian ? 'Yes' : 'No'}`);
  if (state.declaration.needsGuardian) lines.push(`Parent, guardian or care provider typed acknowledgement: ${state.declaration.guardianSignature}`);
  lines.push(`Declaration read and understood: ${state.declaration.acknowledged ? 'Yes' : 'No'}`, '',
    'HEALTH INFORMATION CONSENT', HEALTH_CONSENT_TEXT, `Consent given: ${state.declaration.healthConsent ? 'Yes' : 'No'}`);
  return new URLSearchParams({
    'form-name': HEALTH_FORM_NAME,
    'bot-field': honeypot,
    name: state.details.name.trim(),
    email: state.details.email.trim(),
    'questionnaire-results': lines.join('\n'),
    'health-consent': state.declaration.healthConsent ? HEALTH_CONSENT_TEXT : '',
  });
}
