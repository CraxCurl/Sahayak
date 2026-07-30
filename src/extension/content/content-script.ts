import { PageAnalyzer } from '@dom/analyzer/page-analyzer';
import { SafeDOMExecutor } from '@dom/engine/action-executor';
import { ChatOverlayManager } from '@dom/overlays/chat-overlay';
import { ExtensionMessage } from '@shared/types/messages';

console.log('[Sahayak Content Script] Injected onto page:', window.location.href);

const analyzer = new PageAnalyzer();
const executor = new SafeDOMExecutor();
const chatOverlay = new ChatOverlayManager();

// Mount floating AI Chat Assistant overlay
chatOverlay.mount();

// Listen for messages from background service worker / popup
chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  if (message.type === 'AI_ACTIONS_READY') {
    console.log('[Sahayak Content Script] Received AI Action Manifest:', message.payload.manifest);
    executor.executeManifest(message.payload.manifest);
  } else if (message.type === 'HIGHLIGHT_TARGET_ELEMENT') {
    console.log('[Sahayak Content Script] Highlighting element:', message.payload.selector);
    executor.highlightAndScrollTo(message.payload.selector);
  } else if (message.type === 'DOM_ANALYZE_PAGE') {
    try {
      const data = analyzer.extractPageData();
      sendResponse({ success: true, payload: data });
    } catch (err) {
      sendResponse({ success: false, error: String(err) });
    }
  }
  return true; // Keep message channel open for sendResponse
});

// Auto analyze page on idle load
setTimeout(() => {
  chrome.storage.local.get(['sahayak_active'], items => {
    const isActive = items.sahayak_active !== false; // Default to true if undefined
    if (!isActive) {
      console.log('[Sahayak Content Script] Auto-adaptation is paused');
      return;
    }
    const summary = analyzer.analyzeCurrentPage();
    const msg: ExtensionMessage = {
      type: 'AI_RUN_ANALYSIS',
      payload: {
        textSummary: summary.textSummary,
        userPreferences: { adaptLayout: true, highlightButtons: true },
      },
    };
    chrome.runtime.sendMessage(msg);
  });
}, 1000);
