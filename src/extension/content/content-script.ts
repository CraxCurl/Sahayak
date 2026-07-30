import { PageAnalyzer } from '@dom/analyzer/page-analyzer';
import { SafeDOMExecutor } from '@dom/executor/safe-dom-executor';
import { ChatOverlayManager } from '@dom/overlays/chat-overlay';
import { ExtensionMessage } from '@shared/types/messages';

console.log('[Sahayak Content Script] Injected onto page:', window.location.href);

/**
 * Initialize core Sahayak content script services:
 * - PageAnalyzer: extracts structured text, headings, buttons, and form metadata from active DOM.
 * - SafeDOMExecutor: executes reversible DOM adaptations (highlight, hide, simplify text, accessibility).
 * - ChatOverlayManager: controls Shadow DOM isolation container for floating AI Assistant UI.
 */
const analyzer = new PageAnalyzer();
const executor = new SafeDOMExecutor();
const chatOverlay = new ChatOverlayManager();

/**
 * Triggers full webpage DOM analysis and dispatches an asynchronous `AI_RUN_ANALYSIS` message
 * to the background service worker to process Gemma 3 AI UI adaptations.
 */
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

/**
 * Extension Message Router Listener.
 * Handles incoming IPC messages from the background service worker or popup popup/sidepanel UI:
 * - AI_ACTIONS_READY: Executes generated action manifest (DOM mutation).
 * - HIGHLIGHT_TARGET_ELEMENT: Scrolls to and highlights specific target element.
 * - DOM_ANALYZE_PAGE: Synchronously returns extracted webpage structure JSON.
 * - SAHAYAK_TOGGLE_STATE: Toggles extension active state (mount overlay & auto-analyze vs revertAll & unmount).
 */
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
  health: async () => {
    const { OllamaGemmaClient } = await import('@ai/client/ollama-client');
    const client = new OllamaGemmaClient();
    const result = await client.checkOllamaHealth();
    console.log('[Sahayak Health Check Result]:', result);
    return result;
  },
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
      priority: 'medium',
    }),
  hideElement: (selector: string) =>
    executor.executeSingleAction({
      id: `console-act-${Date.now()}`,
      type: 'HIDE_ELEMENT',
      selector,
      confidence: 1.0,
      reasoning: 'Console manual action',
      priority: 'medium',
    }),
  autofill: (fieldValues: Record<string, string>) =>
    executor.executeSingleAction({
      id: `console-act-${Date.now()}`,
      type: 'AUTOFILL_FORM',
      selector: 'form',
      confidence: 1.0,
      fieldValues,
      reasoning: 'Console autofill action',
      priority: 'medium',
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

/**
 * SPA MutationObserver with Debounce (Phase 1, Requirement 1.6).
 * Watches document.body childList & subtree for structural churn on SPA site navigation (e.g. Next.js, React, Vue).
 * Debounces re-analysis until 800ms of quiet after significant node churn, avoiding infinite re-trigger loops.
 */
let spaDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let lastAnalyzedNodeCount = 0;

const initSpaObserver = () => {
  if (!document.body) return;

  const observer = new MutationObserver(mutations => {
    let significantNodesChanged = 0;
    for (const m of mutations) {
      if (m.type === 'childList') {
        // Ignore Sahayak's own injected overlay elements
        const isSahayakManaged = Array.from(m.addedNodes).some(
          node => node instanceof HTMLElement && (node.id.includes('sahayak') || node.hasAttribute('data-sahayak-managed'))
        );
        if (!isSahayakManaged) {
          significantNodesChanged += m.addedNodes.length + m.removedNodes.length;
        }
      }
    }

    // Ignore minor attribute changes or tiny single-node tweaks to prevent infinite loops
    if (significantNodesChanged < 5) return;

    if (spaDebounceTimer) clearTimeout(spaDebounceTimer);
    spaDebounceTimer = setTimeout(() => {
      chrome.storage.local.get(['sahayak_active'], items => {
        if (items.sahayak_active !== false) {
          const currentCount = document.body.getElementsByTagName('*').length;
          // Guard against re-analyzing if node count churn is negligible
          if (Math.abs(currentCount - lastAnalyzedNodeCount) > 10) {
            console.log('[Sahayak Content Script] SPA DOM churn settled — re-triggering auto-analysis');
            lastAnalyzedNodeCount = currentCount;
            triggerAutoAnalysis();
          }
        }
      });
    }, 800);
  });

  observer.observe(document.body, { childList: true, subtree: true });
};

// Auto analyze page on initial load if extension is active
setTimeout(() => {
  chrome.storage.local.get(['sahayak_active'], items => {
    const isActive = items.sahayak_active !== false; // Default to true if undefined
    if (isActive) {
      chatOverlay.mount();
      triggerAutoAnalysis();
      lastAnalyzedNodeCount = document.body ? document.body.getElementsByTagName('*').length : 0;
      initSpaObserver();
    } else {
      console.log('[Sahayak Content Script] Extension is currently paused');
    }
  });
}, 800);
