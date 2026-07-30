import { ExtractedForm, ExtractedPageData } from '@shared/types/messages';

export interface PageSummaryResult extends ExtractedPageData {
  pageUrl: string;
  textSummary: string;
  formCount: number;
  interactiveSelectors: string[];
}

export class PageAnalyzer {
  public extractPageData(): ExtractedPageData {
    const url = window.location.href;
    const title = (document.title || '').trim();

    const headings = Array.from(
      new Set(
        Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
          .map(h => (h.textContent || '').trim())
          .filter(Boolean)
      )
    );

    const buttons = Array.from(
      new Set(
        Array.from(
          document.querySelectorAll(
            'button, input[type="button"], input[type="submit"], [role="button"]'
          )
        )
          .map(b => {
            if (b.tagName.toLowerCase() === 'input') {
              return ((b as HTMLInputElement).value || '').trim();
            }
            return (b.textContent || b.getAttribute('aria-label') || '').trim();
          })
          .filter(Boolean)
      )
    );

    const inputs = Array.from(
      new Set(
        Array.from(document.querySelectorAll('input, textarea, select'))
          .map(el => {
            const inputEl = el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
            const id = inputEl.id;
            const labelEl = id
              ? document.querySelector(`label[for="${CSS.escape(id)}"]`)
              : inputEl.closest('label');
            const placeholder =
              'placeholder' in inputEl ? (inputEl as HTMLInputElement).placeholder : '';
            return (
              (labelEl?.textContent || '').trim() ||
              placeholder ||
              inputEl.name ||
              inputEl.getAttribute('aria-label') ||
              ''
            ).trim();
          })
          .filter(Boolean)
      )
    );

    const forms: ExtractedForm[] = Array.from(document.querySelectorAll('form')).map(f => ({
      id: f.id || '',
      name: f.getAttribute('name') || '',
      action: f.getAttribute('action') || '',
      method: (f.getAttribute('method') || 'GET').toUpperCase(),
      fieldCount: f.querySelectorAll('input, textarea, select').length,
    }));

    const text = this.collectVisibleText();

    return { url, title, headings, buttons, inputs, forms, text };
  }

  private collectVisibleText(): string {
    const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE']);
    const blocks: string[] = [];
    const walker = document.createTreeWalker(
      document.body || document.documentElement,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const p = node.parentElement;
          if (!p) return NodeFilter.FILTER_REJECT;
          if (SKIP.has(p.tagName)) return NodeFilter.FILTER_REJECT;
          const s = window.getComputedStyle(p);
          if (s.display === 'none' || s.visibility === 'hidden' || parseFloat(s.opacity) === 0) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    let n: Node | null;
    while ((n = walker.nextNode())) {
      const v = (n.textContent || '').trim();
      if (v) blocks.push(v);
    }

    return blocks.join(' ').replace(/\s+/g, ' ').trim().slice(0, 4000);
  }

  public analyzeCurrentPage(): PageSummaryResult {
    const data = this.extractPageData();
    const headingsStr = data.headings.slice(0, 10).join(' | ');
    const paragraphText = data.text.slice(0, 500);

    const textSummary = `Title: ${data.title}\nHeadings: ${headingsStr}\nParagraph Extract: ${paragraphText}`;

    const interactiveSelectors = Array.from(
      document.querySelectorAll('button, a[href], input[type="submit"]')
    )
      .slice(0, 15)
      .map(el => {
        if (el.id) return `#${el.id}`;
        if (el.className && typeof el.className === 'string') {
          const firstClass = el.className.trim().split(/\s+/)[0];
          if (firstClass) return `.${firstClass}`;
        }
        return el.tagName.toLowerCase();
      });

    return {
      ...data,
      pageUrl: data.url,
      textSummary,
      formCount: data.forms.length,
      interactiveSelectors,
    };
  }
}
