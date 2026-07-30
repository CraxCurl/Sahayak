import { PageAnalyzer } from '@dom/analyzer/page-analyzer';
import { SafeDOMExecutor } from '@dom/engine/action-executor';
import { ChatOverlayManager } from '@dom/overlays/chat-overlay';
import { ExtensionMessage } from '@shared/types/messages';

console.log('[Sahayak Content Script] Injected onto page:', window.location.href);

const analyzer = new PageAnalyzer();
const executor = new SafeDOMExecutor();
const chatOverlay = new ChatOverlayManager();

// Function to trigger Ollama AI analysis automatically
const triggerAutoAnalysis = () => {
  try {
    const summary = analyzer.analyzeCurrentPage();
    const msg: ExtensionMessage = {
      type: 'AI_RUN_ANALYSIS',
      payload: {
        textSummary: summary.textSummary,
        userPreferences: { adaptLayout: true, highlightButtons: true },
      },
    };
    chrome.runtime.sendMessage(msg);
  } catch (err) {
    console.warn('[Sahayak Content Script] Could not auto-trigger AI analysis:', err);
  }
};

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
  } else if (message.type === 'SAHAYAK_TOGGLE_STATE') {
    if (message.payload.active) {
      console.log('[Sahayak Content Script] Extension ENABLED - Mount floating chat & trigger Ollama analysis');
      chatOverlay.mount();
      triggerAutoAnalysis();
    } else {
      console.log('[Sahayak Content Script] Extension DISABLED - Reverting all DOM changes & unmounting overlay');
      executor.revertAll();
      chatOverlay.unmount();
    }
  }
  return true; // Keep message channel open for sendResponse
});

// Auto analyze page on initial load if extension is active
setTimeout(() => {
  chrome.storage.local.get(['sahayak_active'], items => {
    const isActive = items.sahayak_active !== false; // Default to true if undefined
    if (isActive) {
      chatOverlay.mount();
      triggerAutoAnalysis();
    } else {
      console.log('[Sahayak Content Script] Extension is currently paused');
    }
  });
}, 800);
