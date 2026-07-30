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

// Expose Sahayak API onto global window for DevTools Console execution & debugging
(window as any).Sahayak = {
  executor,
  analyzer,
  chatOverlay,
  highlight: (selector: string, color = '#38bdf8') => executor.highlightAndScrollTo(selector, color),
  simplifyText: (selector: string, simplifiedContent: string) =>
    executor.executeSingleAction({
      id: `console-act-${Date.now()}`,
      type: 'SIMPLIFY_TEXT',
      selector,
      confidence: 1.0,
      simplifiedContent,
      originalTextSnippet: '',
      reasoning: 'Console manual action',
    }),
  hideElement: (selector: string) =>
    executor.executeSingleAction({
      id: `console-act-${Date.now()}`,
      type: 'HIDE_ELEMENT',
      selector,
      confidence: 1.0,
      reasoning: 'Console manual action',
    }),
  autofill: (fieldValues: Record<string, string>) =>
    executor.executeSingleAction({
      id: `console-act-${Date.now()}`,
      type: 'AUTOFILL_FORM',
      selector: 'form',
      confidence: 1.0,
      fieldValues,
      reasoning: 'Console autofill action',
    }),
  injectCSS: (cssRules: string, scopeId = 'console-injected') =>
    executor.getCSSInjector().injectCSS(scopeId, cssRules),
  setHighContrast: (enable: boolean) =>
    executor.getAccessibilityEngine().setHighContrast(enable),
  setFontScale: (scale: number) =>
    executor.getAccessibilityEngine().setFontScale(scale),
  revertAll: () => executor.revertAll(),
  analyzePage: () => analyzer.extractPageData(),
  executeManifest: (manifest: any) => executor.executeManifest(manifest),
  ask: (question: string) => {
    console.log(`[Sahayak DevTools] Asking: "${question}"...`);
    const pageData = analyzer.analyzeCurrentPage();
    chrome.runtime.sendMessage(
      {
        type: 'CHAT_QUERY_REQUEST',
        payload: {
          question,
          pageUrl: window.location.href,
          textSummary: pageData.textSummary,
        },
      },
      res => {
        if (res && res.success) {
          console.log(`[Sahayak DevTools AI Response]:\n${res.answer}`);
          if (res.highlightSelector) {
            console.log(`[Sahayak DevTools] Highlighting target: ${res.highlightSelector}`);
            executor.highlightAndScrollTo(res.highlightSelector);
          }
        } else {
          console.warn('[Sahayak DevTools] Local query fallback executed.');
          executor.highlightAndScrollTo('h1, header, form');
        }
      }
    );
  },
  help: () => {
    console.group('🚀 Sahayak DevTools Console Commands');
    console.log('window.Sahayak.ask("Where do I upload documents?") -> Query page and highlight element');
    console.log('window.Sahayak.highlight(selector, color)         -> Highlight and scroll to element');
    console.log('window.Sahayak.simplifyText(selector, text)      -> Replace text with simplified badge');
    console.log('window.Sahayak.hideElement(selector)            -> Hide unwanted element');
    console.log('window.Sahayak.injectCSS(cssRules)              -> Inject dynamic CSS into head');
    console.log('window.Sahayak.autofill({ "#full-name": "John" }) -> Prefill form inputs');
    console.log('window.Sahayak.setHighContrast(true/false)     -> Toggle high contrast');
    console.log('window.Sahayak.setFontScale(1.1)                -> Adjust font scale');
    console.log('window.Sahayak.revertAll()                      -> Revert all DOM changes');
    console.log('window.Sahayak.analyzePage()                    -> Print extracted page JSON');
    console.groupEnd();
  },
};

console.log(
  '[Sahayak DevTools API] Loaded on window.Sahayak. Run window.Sahayak.help() in console for list of commands!'
);

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
