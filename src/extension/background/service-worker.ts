import { ExtensionMessage } from '@shared/types/messages';
import { OllamaGemmaClient } from '@ai/client/ollama-client';
import { SAHAYAK_CONSTANTS } from '@shared/constants';

console.log('[Sahayak Background Worker] Service Worker Initialized');

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Sahayak Background Worker] Extension installed successfully');
});

/**
 * Manifest V3 Service Worker Message Router.
 * Handles inter-process communication (IPC) between content scripts, popup, sidepanel,
 * and the local Ollama Gemma 3 AI client.
 */
chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, sender, sendResponse): boolean | void => {
    console.log('[Sahayak Background Worker] Received message:', message.type);

    if (message.type === 'PING_BACKGROUND') {
      sendResponse({ status: 'pong', timestamp: Date.now() });
      return true;
    }

    if (message.type === 'AI_RUN_ANALYSIS') {
      const { textSummary, userPreferences } = message.payload;
      const isFromExtensionPage = sender.url?.startsWith('chrome-extension://');

      // Load dynamic host URL from chrome storage, .env configuration, or default fallback
      chrome.storage.local.get([SAHAYAK_CONSTANTS.STORAGE_KEYS.OLLAMA_URL], async items => {
        const configuredUrl =
          (items[SAHAYAK_CONSTANTS.STORAGE_KEYS.OLLAMA_URL] as string) ||
          import.meta.env.VITE_OLLAMA_URL ||
          'http://localhost:11434';

        const client = new OllamaGemmaClient(configuredUrl);

        try {
          // Determine the target tab for analysis
          let targetTab: chrome.tabs.Tab | undefined;

          if (isFromExtensionPage) {
            // Find the most recently active non-extension tab
            const tabs = await chrome.tabs.query({ currentWindow: true });
            targetTab = tabs
              .filter(t => t.url && !t.url.startsWith('chrome-extension://') && !t.url.startsWith('chrome://'))
              .sort((a, b) => (b.id || 0) - (a.id || 0))[0]; // Fallback logic: newest non-system tab
          } else {
            targetTab = sender.tab;
          }

          const pageUrl = targetTab?.url || 'https://unknown';

          const manifest = await client.generatePageAdaptation(
            pageUrl,
            textSummary,
            userPreferences
          );

          if (targetTab?.id) {
            chrome.tabs.sendMessage(targetTab.id, {
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

    if (message.type === 'CHAT_QUERY_REQUEST') {
      const { question, pageUrl, textSummary } = message.payload;
      const isFromExtensionPage = sender.url?.startsWith('chrome-extension://');

      chrome.storage.local.get([SAHAYAK_CONSTANTS.STORAGE_KEYS.OLLAMA_URL], async items => {
        const configuredUrl =
          (items[SAHAYAK_CONSTANTS.STORAGE_KEYS.OLLAMA_URL] as string) ||
          import.meta.env.VITE_OLLAMA_URL ||
          'http://localhost:11434';

        const client = new OllamaGemmaClient(configuredUrl);

        try {
          const res = await client.askPageQuestion(pageUrl, textSummary, question);

          if (res.highlightSelector) {
            let targetTabId: number | undefined;
            if (isFromExtensionPage) {
               // Send highlight to the tab that matches the pageUrl we analyzed
               const tabs = await chrome.tabs.query({ url: pageUrl });
               targetTabId = tabs[0]?.id;
            } else {
               targetTabId = sender.tab?.id;
            }

            if (targetTabId) {
              chrome.tabs.sendMessage(targetTabId, {
                type: 'HIGHLIGHT_TARGET_ELEMENT',
                payload: { selector: res.highlightSelector, label: question },
              });
            }
          }

          sendResponse({
            success: true,
            answer: res.answer,
            highlightSelector: res.highlightSelector,
          });
        } catch (err) {
          console.error('[Sahayak Background Worker] Chat query error:', err);
          sendResponse({ success: false, error: String(err) });
        }
      });

      return true;
    }

    if (message.type === 'HIGHLIGHT_TARGET_ELEMENT') {
      const { selector, label } = message.payload;
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const activeTabId = tabs[0]?.id;
        if (activeTabId) {
          chrome.tabs.sendMessage(activeTabId, {
            type: 'HIGHLIGHT_TARGET_ELEMENT',
            payload: { selector, label },
          });
        }
      });
      sendResponse({ success: true });
      return true;
    }

    return undefined;
  }
);

/**
 * Long-lived Port Listener for Chat Streams (Phase 1, Requirement 1.3).
 * Prevents MV3 service worker timeout disconnections during multi-second LLM generations.
 */
chrome.runtime.onConnect.addListener(port => {
  if (port.name === 'sahayak-chat-port') {
    port.onMessage.addListener(async (msg: any) => {
      if (msg.type === 'CHAT_QUERY_REQUEST') {
        const { question, pageUrl, textSummary } = msg.payload;

        chrome.storage.local.get([SAHAYAK_CONSTANTS.STORAGE_KEYS.OLLAMA_URL], async items => {
          const configuredUrl =
            (items[SAHAYAK_CONSTANTS.STORAGE_KEYS.OLLAMA_URL] as string) ||
            import.meta.env.VITE_OLLAMA_URL ||
            'http://localhost:11434';

          const client = new OllamaGemmaClient(configuredUrl);

          try {
            const res = await client.askPageQuestion(pageUrl, textSummary, question);

            if (res.highlightSelector) {
              const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
              if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, {
                  type: 'HIGHLIGHT_TARGET_ELEMENT',
                  payload: { selector: res.highlightSelector, label: question },
                });
              }
            }

            port.postMessage({
              success: true,
              answer: res.answer,
              highlightSelector: res.highlightSelector,
            });
          } catch (err) {
            console.error('[Sahayak Service Worker Port] Chat query error:', err);
            port.postMessage({ success: false, error: String(err) });
          }
        });
      }
    });
  }
});
