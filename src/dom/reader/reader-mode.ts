import { CSSInjector } from '../injector/css-injector';

export class ReaderMode {
  private cssInjector: CSSInjector;
  private isActive = false;
  private hiddenElements: HTMLElement[] = [];

  constructor(cssInjector?: CSSInjector) {
    this.cssInjector = cssInjector || new CSSInjector();
  }

  /**
   * Toggle Reader Mode on the current webpage.
   */
  public toggle(): boolean {
    if (this.isActive) {
      this.disable();
    } else {
      this.enable();
    }
    return this.isActive;
  }

  /**
   * Enable Reader Mode: hide non-essential elements & format main content cleanly.
   */
  public enable(): void {
    if (this.isActive) return;

    // Identify non-essential noisy elements to hide
    const selectorsToHide = [
      'aside',
      '.sidebar',
      '#sidebar',
      '.ad',
      '.ads',
      '.advertisement',
      '.banner',
      'header nav',
      'footer',
      '.popup',
      '.modal',
      '.social-share',
      'iframe[src*="doubleclick"]',
    ];

    this.hiddenElements = [];
    selectorsToHide.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        const htmlEl = el as HTMLElement;
        if (htmlEl.style.display !== 'none') {
          htmlEl.setAttribute('data-sahayak-reader-hidden', htmlEl.style.display || 'block');
          htmlEl.style.setProperty('display', 'none', 'important');
          this.hiddenElements.push(htmlEl);
        }
      });
    });

    const readerCSS = `
      body {
        max-width: 800px !important;
        margin: 0 auto !important;
        padding: 24px !important;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif !important;
        line-height: 1.7 !important;
        color: #1e293b !important;
        background-color: #f8fafc !important;
      }

      main, article, .content, #content, [role="main"] {
        max-width: 100% !important;
        width: 100% !important;
        margin: 0 auto !important;
        float: none !important;
      }

      h1, h2, h3, h4 {
        color: #0f172a !important;
        line-height: 1.3 !important;
        margin-top: 1.5em !important;
        margin-bottom: 0.5em !important;
      }

      p {
        margin-bottom: 1.25em !important;
        font-size: 1.125rem !important;
      }

      img {
        max-width: 100% !important;
        height: auto !important;
        border-radius: 8px !important;
        margin: 16px 0 !important;
      }
    `;

    this.cssInjector.injectCSS('reader-mode-layout', readerCSS);
    this.isActive = true;
    console.log('[Sahayak Reader Mode] Enabled distraction-free mode');
  }

  /**
   * Disable Reader Mode & restore original webpage layout.
   */
  public disable(): void {
    if (!this.isActive) return;

    this.cssInjector.removeCSS('reader-mode-layout');

    this.hiddenElements.forEach((el) => {
      const prevDisplay = el.getAttribute('data-sahayak-reader-hidden');
      el.style.display = prevDisplay === 'block' ? '' : prevDisplay || '';
      el.removeAttribute('data-sahayak-reader-hidden');
    });
    this.hiddenElements = [];

    this.isActive = false;
    console.log('[Sahayak Reader Mode] Disabled');
  }

  public getIsActive(): boolean {
    return this.isActive;
  }
}
