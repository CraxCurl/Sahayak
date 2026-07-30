/**
 * content.js — minimal DOM extractor for the Dev 1 Message Router pipeline.
 * Scoped strictly to delivering EXTRACT_DOM responses.
 */

(() => {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== 'EXTRACT_DOM') return false;
    try {
      sendResponse({ success: true, payload: extractPageData() });
    } catch (err) {
      sendResponse({ success: false, error: String(err) });
    }
    return true;
  });

  function extractPageData() {
    const title = (document.title || '').trim();

    const headings = Array.from(new Set(
      Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
        .map(h => (h.textContent || '').trim())
        .filter(Boolean)
    ));

    const buttons = Array.from(new Set(
      Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"], [role="button"]'))
        .map(b => (b.innerText || b.value || b.getAttribute('aria-label') || '').trim())
        .filter(Boolean)
    ));

    const inputs = Array.from(new Set(
      Array.from(document.querySelectorAll('input, textarea, select'))
        .map(el => {
          const labelEl = el.id ? document.querySelector(`label[for="${CSS.escape(el.id)}"]`) : el.closest('label');
          return (
            (labelEl?.textContent || '').trim() ||
            el.placeholder || el.name || el.getAttribute('aria-label') || ''
          ).trim();
        })
        .filter(Boolean)
    ));

    const forms = Array.from(document.querySelectorAll('form')).map(f => ({
      id: f.id || '', name: f.getAttribute('name') || '', action: f.getAttribute('action') || '',
      method: (f.getAttribute('method') || 'GET').toUpperCase(),
      fieldCount: f.querySelectorAll('input, textarea, select').length,
    }));

    const text = collectVisibleText();

    return { url: window.location.href, title, headings, buttons, inputs, forms, text };
  }

  function collectVisibleText() {
    const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE']);
    const blocks = [];
    const walker = document.createTreeWalker(document.body || document.documentElement, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const p = node.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        if (SKIP.has(p.tagName)) return NodeFilter.FILTER_REJECT;
        const s = window.getComputedStyle(p);
        if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    let n;
    while ((n = walker.nextNode())) {
      const v = (n.textContent || '').trim();
      if (v) blocks.push(v);
    }
    return blocks.join(' ').replace(/\s+/g, ' ').trim().slice(0, 4000);
  }
})();