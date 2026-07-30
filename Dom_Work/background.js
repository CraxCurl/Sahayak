/**
 * background.js — Service Worker (Chrome APIs)
 *
 * Dev 1 scope: Service Worker event loop + Chrome API handlers.
 * Routes messages between popup, content script, and the AI module.
 */

import { MessageType } from './message-router.js';

console.log('[Sahayak Background] Service Worker initialized');

const AI_ENDPOINT = 'http://localhost:11434/api/generate';
const AI_MODEL = 'gemma3:4b';

/* ----- Lifecycle ----- */

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Sahayak Background] Extension installed');
});

/* ----- IPC router ----- */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message.type !== 'string') return false;

  switch (message.type) {
    case MessageType.PING_BACKGROUND:
      sendResponse({ status: 'pong', timestamp: Date.now() });
      return false;

    case MessageType.EXTRACT_DOM: {
      const tabId = sender.tab?.id;
      if (!tabId) {
        sendResponse({ success: false, error: 'no-tab' });
        return false;
      }
      chrome.tabs.sendMessage(tabId, { type: MessageType.EXTRACT_DOM }, sendResponse);
      return true;
    }

    case MessageType.DOM_EXTRACTED:
      handleExtractedPayload(message.payload)
        .then(manifest => sendResponse({ success: true, manifest }))
        .catch(err => sendResponse({ success: false, error: String(err) }));
      return true;

    default:
      return false;
  }
});

/* ----- AI hand-off (local Ollama / Gemma 3) ----- */

async function handleExtractedPayload(payload) {
  const prompt = buildPrompt(payload);
  try {
    const res = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: AI_MODEL, prompt, stream: false, format: 'json' }),
    });
    if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
    const data = await res.json();
    return parseManifest(data.response || '');
  } catch (err) {
    console.warn('[Sahayak Background] Ollama unreachable, using local stub:', err);
    return fallbackManifest(payload);
  }
}

function buildPrompt(p) {
  return [
    'You are Sahayak AI. Analyze the following webpage snapshot and propose',
    'non-destructive UI adaptations. Return strictly valid JSON.',
    '',
    `URL: ${p?.url || ''}`,
    `Title: ${p?.title || ''}`,
    `Headings: ${(p?.headings || []).join(' | ')}`,
    `Buttons: ${(p?.buttons || []).join(', ')}`,
    `Inputs: ${(p?.inputs || []).join(', ')}`,
    `Forms: ${(p?.forms || []).length}`,
    `Visible Text: ${(p?.text || '').slice(0, 1500)}`,
  ].join('\n');
}

function parseManifest(raw) {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
  else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
  try { return JSON.parse(cleaned); }
  catch { return fallbackManifest({ url: '' }); }
}

function fallbackManifest(p) {
  return {
    version: '1.0',
    pageUrl: p?.url || '',
    summary: 'Local fallback manifest (Ollama offline).',
    actions: [{
      id: 'fallback-1',
      type: 'HIGHLIGHT_ELEMENT',
      selector: 'main, article, h1',
      confidence: 0.9,
      color: '#38bdf8',
    }],
  };
}
