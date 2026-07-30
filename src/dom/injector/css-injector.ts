export class CSSInjector {
  private injectedStyles: Map<string, HTMLStyleElement> = new Map();

  /**
   * Inject CSS rules into document head tagged with a unique scope ID.
   */
  public injectCSS(scopeId: string, cssRules: string): HTMLStyleElement {
    if (this.injectedStyles.has(scopeId)) {
      const existing = this.injectedStyles.get(scopeId)!;
      existing.textContent = cssRules;
      return existing;
    }

    const styleEl = document.createElement('style');
    styleEl.setAttribute('id', `sahayak-css-${scopeId}`);
    styleEl.setAttribute('data-sahayak-managed', 'true');
    styleEl.textContent = cssRules;

    document.head.appendChild(styleEl);
    this.injectedStyles.set(scopeId, styleEl);
    return styleEl;
  }

  /**
   * Remove injected CSS style block by scope ID.
   */
  public removeCSS(scopeId: string): boolean {
    const styleEl = this.injectedStyles.get(scopeId);
    if (styleEl) {
      styleEl.remove();
      this.injectedStyles.delete(scopeId);
      return true;
    }
    return false;
  }

  /**
   * Remove all CSS rules injected by Sahayak.
   */
  public clearAllInjections(): void {
    this.injectedStyles.forEach(styleEl => {
      styleEl.remove();
    });
    this.injectedStyles.clear();

    // Secondary cleanup for any stray style elements tagged with data-sahayak-managed
    document.querySelectorAll('style[data-sahayak-managed]').forEach(el => el.remove());
  }

  /**
   * Injects base animations and global highlight utility classes.
   */
  public injectBaseStyles(): void {
    const baseCSS = `
      @keyframes sahayak-pulse-highlight {
        0% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(56, 189, 248, 0); }
        100% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0); }
      }
      
      .sahayak-highlighted-element {
        animation: sahayak-pulse-highlight 2s infinite !important;
        border-radius: 4px !important;
        transition: all 0.3s ease !important;
      }
      
      .sahayak-simplified-badge {
        display: inline-block !important;
        background-color: rgba(56, 189, 248, 0.15) !important;
        border-left: 3px solid #38bdf8 !important;
        padding: 4px 8px !important;
        margin: 2px 0 !important;
        border-radius: 0 4px 4px 0 !important;
        font-family: inherit !important;
        line-height: 1.5 !important;
      }

      .sahayak-autofilled-field {
        background-color: rgba(34, 197, 94, 0.1) !important;
        border: 2px solid #22c55e !important;
        transition: background-color 0.5s ease !important;
      }
    `;
    this.injectCSS('base-global-styles', baseCSS);
  }
}
