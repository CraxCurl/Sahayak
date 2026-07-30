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

// Listen for messages from background service worker
chrome.runtime.onMessage.addListener((message: ExtensionMessage) => {
  if (message.type === 'AI_ACTIONS_READY') {
    console.log('[Sahayak Content Script] Received AI Action Manifest:', message.payload.manifest);
    executor.executeManifest(message.payload.manifest);
  } else if (message.type === 'HIGHLIGHT_TARGET_ELEMENT') {
    console.log('[Sahayak Content Script] Highlighting element:', message.payload.selector);
    executor.highlightAndScrollTo(message.payload.selector);
  }
});

// Auto analyze page on idle load
setTimeout(() => {
  const summary = analyzer.analyzeCurrentPage();
  const msg: ExtensionMessage = {
    type: 'AI_RUN_ANALYSIS',
    payload: {
      textSummary: summary.textSummary,
      userPreferences: { adaptLayout: true, highlightButtons: true },
    },
  };
  chrome.runtime.sendMessage(msg);
}, 1000);
