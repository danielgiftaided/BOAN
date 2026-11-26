import { healthQuestionnaire as source } from './content/health-questionnaire.js';
import { createQuestionnaireState, needsFollowups, questionnaireSteps, clearInapplicableAnswers, guidanceFor, currentClinicalQuestions, validateQuestionnaireStep } from './health-questionnaire-state.js';

const form = document.querySelector('#health-questionnaire-form');
if (form) {
  const step = document.querySelector('#hq-step');
  const back = document.querySelector('#hq-back');
  const next = document.querySelector('#hq-next');
  const phases = document.querySelector('#hq-phases');
  const progress = document.querySelector('#hq-progress');
  const progressLabel = document.querySelector('#hq-progress-label');
  let state = createQuestionnaireState();
  let errors = {};
  let finished = false;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const id = key => `hq-${key}`;
  const paragraphs = values => values.map(value => `<p>${escape(value)}</p>`).join('');
  const error = key => errors[key] ? `<p class="hq-field-error" id="${id(key)}-error">${escape(errors[key])}</p>` : '';
  const invalid = key => errors[key] ? ` aria-invalid="true" aria-describedby="${id(key)}-error"` : '';

  function textField(key, label, value, { scope = 'details', type = 'text', required = false, multiline = false, readonly = false, hint = '' } = {}) {
    const attributes = `id="${id(key)}" name="${key}" data-scope="${scope}"${required ? ' required' : ''}${readonly ? ' readonly' : ''}${invalid(key)}`;
    return `<div class="hq-field"><label for="${id(key)}">${escape(label)}${required ? ' <span class="hq-required">(required)</span>' : ''}</label>${hint ? `<p class="hq-hint">${escape(hint)}</p>` : ''}${multiline ? `<textarea ${attributes} rows="3" maxlength="3000">${escape(value)}</textarea>` : `<input ${attributes} type="${type}" value="${escape(value)}"${type === 'text' ? ' maxlength="300"' : ''}/>`}${error(key)}</div>`;
  }

  function detailField(detail) {
    if (detail.type !== 'multiple') return textField(detail.id, detail.text, state.answers[detail.id], { scope: 'answers', required: true, multiline: true });
    const selected = state.answers[detail.id] || [];
    return `<fieldset class="hq-detail" id="${id(detail.id)}"${invalid(detail.id)}><legend>${escape(detail.text)} <span class="hq-required">(required)</span></legend><p class="hq-hint">You can select both.</p><div class="hq-options">${detail.options.map((option, i) => `<label class="hq-choice"><input type="checkbox" name="${detail.id}" data-scope="answers" value="${escape(option)}"${selected.includes(option) ? ' checked' : ''}/><span>${escape(option)}</span></label>`).join('')}</div>${error(detail.id)}</fieldset>`;
  }

  function yesNo(question) {
    const reference = question.id.slice(1);
    const descriptions = [question.note ? `${id(question.id)}-note` : '', errors[question.id] ? `${id(question.id)}-error` : ''].filter(Boolean).join(' ');
    return `<fieldset class="hq-question" id="${id(question.id)}"${errors[question.id] ? ' aria-invalid="true"' : ''}${descriptions ? ` aria-describedby="${descriptions}"` : ''}><legend><span class="hq-question-reference">${escape(reference)}.</span> ${escape(question.text)}</legend>${question.note ? `<p class="hq-clinical-note" id="${id(question.id)}-note">${escape(question.note)}</p>` : ''}<div class="hq-options">${['YES', 'NO'].map(value => `<label class="hq-choice"><input type="radio" name="${question.id}" value="${value}" data-scope="answers" required${state.answers[question.id] === value ? ' checked' : ''}/><span>${value === 'YES' ? 'Yes' : 'No'}</span></label>`).join('')}</div>${error(question.id)}</fieldset>${question.detail && state.answers[question.id] === 'YES' ? detailField(question.detail) : ''}`;
  }

  function checkedField(key, label, value) {
    return `<div class="hq-field"><label class="hq-check" for="${id(key)}"><input type="checkbox" id="${id(key)}" name="${key}" data-scope="declaration"${value ? ' checked' : ''}${invalid(key)}/><span>${escape(label)}</span></label>${error(key)}</div>`;
  }

  function guidance() {
    return `<div class="hq-guidance"><h3>Guidance from the questionnaire</h3>${paragraphs(guidanceFor(state))}</div>`;
  }

  function renderDetails() {
    return `<h2 id="hq-step-title" tabindex="-1">Let’s start with you.</h2><p class="hq-step-description">Tell us what interests you. Use sample details while you explore this preview.</p><div class="hq-field-grid">${textField('name', 'Your name', state.details.name, { required: true })}${textField('email', 'Email address', state.details.email, { type: 'email', required: true })}</div><fieldset class="hq-interests"><legend>What would you like to explore? <span class="hq-required">(optional)</span></legend><p class="hq-hint">Choose as many as you like, or leave this for now.</p><div class="hq-interest-options">${['Movement', 'Workshops', 'Creative', 'Retreats'].map(value => `<label class="hq-choice"><input type="checkbox" name="interests" value="${value}" data-scope="details"${state.details.interests.includes(value) ? ' checked' : ''}/><span>${value}</span></label>`).join('')}</div></fieldset>${textField('support', 'Anything that would help you take part? (optional)', state.details.support, { multiline: true })}`;
  }

  function renderGeneral() {
    return `<h2 id="hq-step-title" tabindex="-1">Your general health</h2><p class="hq-step-description">${escape(source.title)}</p>${source.intro ? `<p>${escape(source.intro)}</p>` : ''}<p>Please read the 7 questions below carefully and answer each one honestly: check YES or NO.</p>${source.general.map(yesNo).join('')}`;
  }

  function renderCondition() {
    const condition = source.conditions.find(item => item.id === state.step);
    const number = source.conditions.indexOf(condition) + 1;
    return `<p class="hq-condition-count">Medical follow-up ${number} of ${source.conditions.length}</p><h2 id="hq-step-title" tabindex="-1">${escape(condition.title)}</h2><p class="hq-step-description">Choose Yes or No. If this condition is present, the relevant follow-up questions will appear below.</p>${currentClinicalQuestions(state).map(yesNo).join('')}${condition.detail && state.answers[condition.id] === 'YES' ? detailField(condition.detail) : ''}`;
  }

  function renderDeclaration() {
    const declaration = needsFollowups(state) ? source.declarations.followup : source.declarations.general;
    return `<h2 id="hq-step-title" tabindex="-1">Participant declaration</h2>${guidance()}<div class="hq-declaration-copy"><h3>Please read before continuing</h3><p>${escape(declaration)}</p><p>${escape(source.guardianNote)}</p></div><div class="hq-field-grid">${textField('registeredName', 'Name', state.details.name, { readonly: true })}${textField('date', 'Date', state.declaration.date, { scope: 'declaration', type: 'date', required: true })}</div>${textField('signature', 'Signature (typed name for this preview)', state.declaration.signature, { scope: 'declaration', required: true, hint: 'Type your name as an acknowledgement. Signing arrangements will be confirmed before this form collects real responses.' })}${textField('witness', 'Witness (optional)', state.declaration.witness, { scope: 'declaration' })}${checkedField('needsGuardian', 'A parent, guardian or care provider needs to sign too.', state.declaration.needsGuardian)}${state.declaration.needsGuardian ? textField('guardianSignature', 'Parent, guardian or care provider signature (typed name)', state.declaration.guardianSignature, { scope: 'declaration', required: true }) : ''}${checkedField('acknowledged', 'I have read and understood the participant declaration above.', state.declaration.acknowledged)}`;
  }

  const displayAnswer = value => Array.isArray(value) ? value.join(', ') || 'Not provided' : value === 'YES' ? 'Yes' : value === 'NO' ? 'No' : String(value || 'Not provided');
  const reviewRow = (label, value) => `<div><dt>${escape(label)}</dt><dd>${escape(displayAnswer(value))}</dd></div>`;
  function clinicalReview(questions) {
    return questions.map(question => reviewRow(question.text, state.answers[question.id]) + (question.detail && state.answers[question.id] === 'YES' ? reviewRow(question.detail.text, state.answers[question.detail.id]) : '')).join('');
  }

  function renderReview() {
    return `<h2 id="hq-step-title" tabindex="-1">Review your answers</h2><p class="hq-step-description">You can go Back to make changes. Finishing this preview will clear the sample answers without sending them to BOAN.</p><h3>Your details</h3><dl class="hq-review">${reviewRow('Name', state.details.name)}${reviewRow('Email address', state.details.email)}${reviewRow('Programme interests', state.details.interests)}${reviewRow('What would help you take part', state.details.support)}</dl><details class="hq-review-group" open><summary>General health answers</summary><dl class="hq-review">${clinicalReview(source.general)}</dl></details>${needsFollowups(state) ? source.conditions.map(condition => `<details class="hq-review-group"><summary>${escape(condition.title)}</summary><dl class="hq-review">${reviewRow(condition.gate.text, state.answers[condition.id])}${state.answers[condition.id] === 'YES' ? clinicalReview(condition.questions) + (condition.detail ? reviewRow(condition.detail.text, state.answers[condition.detail.id]) : '') : ''}</dl></details>`).join('') : ''}<h3>Declaration</h3><dl class="hq-review">${reviewRow('Name', state.details.name)}${reviewRow('Date', state.declaration.date)}${reviewRow('Typed signature', state.declaration.signature)}${reviewRow('Witness', state.declaration.witness)}${state.declaration.needsGuardian ? reviewRow('Parent, guardian or care provider typed signature', state.declaration.guardianSignature) : ''}${reviewRow('Declaration read and understood', state.declaration.acknowledged ? 'YES' : 'NO')}</dl>`;
  }

  function updateProgress() {
    if (finished) {
      phases.innerHTML = '<li class="complete">Preview finished</li>';
      progress.max = 1;
      progress.value = 1;
      progressLabel.textContent = 'Preview complete';
      return;
    }
    const steps = questionnaireSteps(state);
    const current = steps.indexOf(state.step);
    const items = [['details', 'Your details'], ['general', 'General health'], ...(needsFollowups(state) ? [['medical', 'Medical follow-ups']] : []), ['declaration', 'Declaration'], ['review', 'Review']];
    const phaseKey = state.step.startsWith('F') ? 'medical' : state.step;
    const phaseIndex = items.findIndex(([key]) => key === phaseKey);
    phases.innerHTML = items.map(([key, label], index) => `<li${index === phaseIndex ? ' aria-current="step"' : ''}${index < phaseIndex ? ' class="complete"' : ''}><span class="hq-phase-number" aria-hidden="true">${index < phaseIndex ? '✓' : index + 1}</span><span>${label}</span></li>`).join('');
    progress.max = steps.length;
    progress.value = current + 1;
    progressLabel.textContent = `Step ${current + 1} of ${steps.length}`;
  }

  function render({ moveFocus = false, preserveFocus = null, focusErrors = false } = {}) {
    clearInapplicableAnswers(state);
    updateProgress();
    const summary = Object.keys(errors).length ? `<div id="hq-errors" class="hq-error-summary" tabindex="-1" role="alert"><h3>Please check your answers</h3><ul>${Object.entries(errors).map(([key, message]) => `<li><a href="#${id(key)}" data-error-link="${key}">${escape(message)}</a></li>`).join('')}</ul></div>` : '';
    if (finished) {
      step.innerHTML = '<div class="hq-complete"><span class="hq-complete-mark" aria-hidden="true">✓</span><h2 id="hq-step-title" tabindex="-1">Preview complete</h2><p>Your sample answers have been cleared. No questionnaire has been sent to BOAN.</p><button class="button lime" type="button" data-hq-restart>Try another route</button><a class="hq-return" href="join-community.html">Back to Join our community</a></div>';
    } else {
      const content = state.step === 'details' ? renderDetails() : state.step === 'general' ? renderGeneral() : state.step === 'declaration' ? renderDeclaration() : state.step === 'review' ? renderReview() : renderCondition();
      step.innerHTML = summary + content;
    }
    back.hidden = finished || state.step === 'details';
    next.hidden = finished;
    next.textContent = state.step === 'review' ? 'Finish preview' : state.step === 'declaration' ? 'Review answers' : 'Next';
    if (focusErrors) {
      document.querySelector('#hq-errors').focus();
    } else if (preserveFocus) {
      [...form.querySelectorAll('[name]')].find(input => input.name === preserveFocus.name && input.value === preserveFocus.value)?.focus({ preventScroll: true });
    } else if (moveFocus) {
      document.querySelector('#hq-step-title').focus({ preventScroll: true });
      document.querySelector('#hq-card').scrollIntoView({ block: 'start' });
    }
  }

  function updateControl(control) {
    const scope = control.dataset.scope;
    if (!scope) return;
    const key = control.name;
    let value = control.value;
    if (control.type === 'checkbox') {
      value = key === 'needsGuardian' || key === 'acknowledged' ? control.checked : [...form.querySelectorAll('input[type="checkbox"]')].filter(input => input.name === key && input.checked).map(input => input.value);
    }
    if (scope === 'details') {
      if (key === 'name' && value !== state.details.name) state.declaration.signature = '';
      state.details[key] = value;
    } else if (scope === 'declaration') {
      state.declaration[key] = value;
    } else {
      state.answers[key] = value;
    }
    if (scope !== 'declaration') state.declaration.acknowledged = false;
    clearInapplicableAnswers(state);
  }

  form.addEventListener('input', event => {
    if (event.target.matches('input:not([type="radio"]):not([type="checkbox"]),textarea')) updateControl(event.target);
  });
  form.addEventListener('change', event => {
    const control = event.target;
    if (!control.matches('input[type="radio"],input[type="checkbox"]')) return;
    updateControl(control);
    if (control.dataset.scope === 'answers' || control.name === 'needsGuardian') {
      errors = {};
      render({ preserveFocus: { name: control.name, value: control.value } });
    }
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (finished) return;
    errors = validateQuestionnaireStep(state);
    if (Object.keys(errors).length) return render({ focusErrors: true });
    if (state.step === 'review') {
      state = createQuestionnaireState();
      finished = true;
    } else {
      const steps = questionnaireSteps(state);
      state.step = steps[steps.indexOf(state.step) + 1];
    }
    render({ moveFocus: true });
  });
  back.addEventListener('click', () => {
    const steps = questionnaireSteps(state);
    state.step = steps[Math.max(0, steps.indexOf(state.step) - 1)];
    errors = {};
    render({ moveFocus: true });
  });
  form.addEventListener('click', event => {
    const errorLink = event.target.closest('[data-error-link]');
    if (errorLink) {
      event.preventDefault();
      const field = document.getElementById(id(errorLink.dataset.errorLink));
      (field?.matches('fieldset') ? field.querySelector('input,textarea') : field)?.focus();
    }
    if (event.target.closest('[data-hq-restart]')) {
      state = createQuestionnaireState();
      errors = {};
      finished = false;
      render({ moveFocus: true });
    }
  });
  render();
}
