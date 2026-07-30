import { ExtensionMessage } from '@shared/types/messages';
import { OllamaGemmaClient } from '@ai/api/ollama-client';

console.log('[Sahayak Background Worker] Service Worker Initialized (Ollama Gemma 3 Local AI)');

const ollamaClient = new OllamaGemmaClient();

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Sahayak Background Worker] Extension installed successfully');
});

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, sender, sendResponse): boolean | void => {
    console.log('[Sahayak Background Worker] Received message:', message.type);

    if (message.type === 'PING_BACKGROUND') {
      sendResponse({ status: 'pong', timestamp: Date.now() });
      return true;
    }

    if (message.type === 'AI_RUN_ANALYSIS') {
      const { textSummary, userPreferences } = message.payload;
      const senderTabId = sender.tab?.id;
      const pageUrl = sender.tab?.url || 'https://unknown';

      ollamaClient
        .generatePageAdaptation(pageUrl, textSummary, userPreferences)
        .then(manifest => {
          if (senderTabId) {
            chrome.tabs.sendMessage(senderTabId, {
              type: 'AI_ACTIONS_READY',
              payload: { manifest },
            });
          }
          sendResponse({ success: true, manifest });
        })
        .catch(err => {
          console.error('[Sahayak Background Worker] Ollama analysis error:', err);
          sendResponse({ success: false, error: String(err) });
        });

      return true; // Asynchronous response channel
    }

    return undefined;
  }
);
