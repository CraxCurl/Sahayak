import { ExtensionMessage } from '@shared/types/messages';
import { OllamaGemmaClient } from '@ai/api/ollama-client';
import { SAHAYAK_CONSTANTS } from '@shared/constants';

console.log('[Sahayak Background Worker] Service Worker Initialized');

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

      // Load dynamic host URL from chrome storage, .env configuration, or default fallback
      chrome.storage.local.get([SAHAYAK_CONSTANTS.STORAGE_KEYS.OLLAMA_URL], async items => {
        const configuredUrl =
          (items[SAHAYAK_CONSTANTS.STORAGE_KEYS.OLLAMA_URL] as string) ||
          import.meta.env.VITE_OLLAMA_URL ||
          'http://localhost:11434';

        const client = new OllamaGemmaClient(configuredUrl);

        try {
          const manifest = await client.generatePageAdaptation(
            pageUrl,
            textSummary,
            userPreferences
          );
          if (senderTabId) {
            chrome.tabs.sendMessage(senderTabId, {
              type: 'AI_ACTIONS_READY',
              payload: { manifest },
            });
          }
          sendResponse({ success: true, manifest });
        } catch (err) {
          console.error('[Sahayak Background Worker] Ollama analysis error:', err);
          sendResponse({ success: false, error: String(err) });
        }
      });

      return true; // Asynchronous response channel
    }

    return undefined;
  }
);
