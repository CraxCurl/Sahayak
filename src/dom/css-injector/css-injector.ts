import { sanitizeCSS } from './css-sanitizer';

export class CSSInjector {
  private injectedStyles: Map<string, HTMLStyleElement> = new Map();

  /**
   * Inject CSS rules into document head tagged with a unique scope ID.
   */
  public injectCSS(scopeId: string, cssRules: string): HTMLStyleElement | null {
    const sanitized = sanitizeCSS(cssRules);
    if (!sanitized) return null;

    if (this.injectedStyles.has(scopeId)) {
      const existing = this.injectedStyles.get(scopeId)!;
      existing.textContent = sanitized;
      return existing;
    }

    const styleEl = document.createElement('style');
    styleEl.setAttribute('id', `sahayak-css-${scopeId}`);
    styleEl.setAttribute('data-sahayak-managed', 'true');
    styleEl.textContent = sanitized;

    document.head.appendChild(styleEl);
    this.injectedStyles.set(scopeId, styleEl);
    return styleEl;
  }

  public removeCSS(scopeId: string): boolean {
    const styleEl = this.injectedStyles.get(scopeId);
    if (styleEl) {
      styleEl.remove();
      this.injectedStyles.delete(scopeId);
      return true;
    }
    return false;
  }

  public clearAllInjections(): void {
    this.injectedStyles.forEach(styleEl => {
      styleEl.remove();
    });
    this.injectedStyles.clear();
    document.querySelectorAll('style[data-sahayak-managed]').forEach(el => el.remove());
  }

  public injectBaseStyles(): void {
    const baseCSS = `
      @keyframes sahayak-pulse-highlight {
        0% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(56, 189, 248, 0); }
        100% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0); }
      }
      
      body {
        line-height: 1.7 !important;
        letter-spacing: 0.01em !important;
        text-rendering: optimizeLegibility !important;
      }

      p {
        margin-bottom: 1rem !important;
      }

      h1, h2, h3 {
        line-height: 1.3 !important;
        margin-bottom: 0.75rem !important;
      }

      .sahayak-highlighted-element {
        animation: sahayak-pulse-highlight 2s infinite !important;
        border-radius: 6px !important;
        outline: 3px solid #38bdf8 !important;
        outline-offset: 2px !important;
        transition: all 0.3s ease !important;
      }
      
      .sahayak-simplified-badge {
        display: inline-block !important;
        background-color: rgba(56, 189, 248, 0.12) !important;
        border-left: 4px solid #38bdf8 !important;
        padding: 6px 12px !important;
        margin: 4px 0 !important;
        border-radius: 0 8px 8px 0 !important;
        font-family: inherit !important;
        line-height: 1.6 !important;
        color: inherit !important;
      }

      .sahayak-autofilled-field {
        background-color: rgba(34, 197, 94, 0.1) !important;
        border: 2px solid #22c55e !important;
        transition: background-color 0.5s ease !important;
      }

      button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible {
        outline: 3px solid #38bdf8 !important;
        outline-offset: 2px !important;
      }
    `;
    this.injectCSS('base-global-styles', baseCSS);
  }
}
