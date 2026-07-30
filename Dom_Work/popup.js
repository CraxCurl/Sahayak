/**
 * popup.js — Popup UI (Dev 1 scope).
 *
 * Talks to background / content scripts exclusively through MessageRouter.
 * No direct chrome.* API calls — all IPC goes through the Message Router.
 */

import { MessageRouter } from './message-router.js';

const $ = id => document.getElementById(id);
const extractBtn = $('extract-btn');
const sendAiBtn = $('send-ai-btn');
const statusDot = $('status-dot');
const results = $('results');

let lastPayload = null;

function setStatus(state) { statusDot.className = `status-dot ${state}`; }

function render(payload) {
  lastPayload = payload;
  $('title-text').textContent = payload.title || '(no title)';
  $('stat-buttons').textContent = payload.buttons.length;
  $('stat-inputs').textContent = payload.inputs.length;
  $('stat-forms').textContent = payload.forms.length;

  renderChips('headings-body', 'hdg-count', payload.headings);
  renderChips('buttons-body', 'btn-count', payload.buttons);
  renderChips('inputs-body', 'inp-count', payload.inputs);

  $('text-preview').textContent = payload.text || '(no visible text)';

  results.classList.remove('hidden');
  sendAiBtn.classList.remove('hidden');
  setStatus('active');
  extractBtn.textContent = 'Refresh Extraction';
}

function renderChips(bodyId, countId, items) {
  const body = $(bodyId);
  const count = $(countId);
  body.innerHTML = '';
  count.textContent = items.length;
  if (items.length === 0) {
    const empty = document.createElement('span');
    empty.className = 'empty';
    empty.textContent = 'none detected';
    body.appendChild(empty);
    return;
  }
  const frag = document.createDocumentFragment();
  items.slice(0, 12).forEach(label => {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = label;
    frag.appendChild(chip);
  });
  if (items.length > 12) {
    const more = document.createElement('span');
    more.className = 'chip';
    more.textContent = `+${items.length - 12} more`;
    frag.appendChild(more);
  }
  body.appendChild(frag);
}

/* ----- Init: ping the background worker to drive the status dot ----- */
(async function init() {
  try {
    const res = await MessageRouter.ping();
    if (res?.status === 'pong') setStatus('active');
  } catch { setStatus('error'); }
})();

/* ----- Event handlers ----- */

extractBtn.addEventListener('click', async () => {
  extractBtn.disabled = true;
  setStatus('working');
  extractBtn.textContent = 'Extracting…';

  try {
    const res = await MessageRouter.extractActiveTab();
    extractBtn.disabled = false;
    if (res?.success) render(res.payload);
    else {
      setStatus('error');
      extractBtn.textContent = 'Extract Page Data';
    }
  } catch (err) {
    extractBtn.disabled = false;
    setStatus('error');
    extractBtn.textContent = 'Extract Page Data';
    alert('Cannot reach content script. Try reloading the page.');
  }
});

sendAiBtn.addEventListener('click', async () => {
  if (!lastPayload) return;
  setStatus('working');
  sendAiBtn.disabled = true;
  sendAiBtn.textContent = 'Sending…';

  try {
    const res = await MessageRouter.forwardToAI(lastPayload);
    sendAiBtn.disabled = false;
    sendAiBtn.textContent = 'Send to AI Module →';
    setStatus(res?.success ? 'active' : 'error');

    const summary = res?.manifest?.summary ?? res?.manifest?.actions?.[0]?.reasoning
      ?? JSON.stringify(res?.manifest ?? {}).slice(0, 200);
    alert('AI Module Response:\n\n' + summary);
  } catch (err) {
    sendAiBtn.disabled = false;
    sendAiBtn.textContent = 'Send to AI Module →';
    setStatus('error');
  }
});
