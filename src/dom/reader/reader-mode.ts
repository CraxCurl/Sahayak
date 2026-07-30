import { CSSInjector } from '../injector/css-injector';

export type SimplificationMode = 'NONE' | 'READER' | 'FOCUS' | 'MINIMAL' | 'BEGINNER';

export class ReaderMode {
  private cssInjector: CSSInjector;
  private currentMode: SimplificationMode = 'NONE';
  private hiddenElements: HTMLElement[] = [];
  private injectedBadges: HTMLElement[] = [];

  constructor(cssInjector?: CSSInjector) {
    this.cssInjector = cssInjector || new CSSInjector();
  }

  /**
   * Enable Distraction-Free Reader Mode.
   */
  public enable(): void {
    this.setMode('READER');
  }

  /**
   * Disable all active simplification modes and restore page.
   */
  public disable(): void {
    this.setMode('NONE');
  }

  /**
   * Toggle Reader Mode.
   */
  public toggle(): boolean {
    if (this.currentMode === 'READER') {
      this.disable();
      return false;
    }
    this.enable();
    return true;
  }

  /**
   * Switch to a specific simplification mode.
   */
  public setMode(mode: SimplificationMode): void {
    this.disableAll();
    this.currentMode = mode;

    switch (mode) {
      case 'READER':
        this.applyReaderMode();
        break;
      case 'FOCUS':
        this.applyFocusMode();
        break;
      case 'MINIMAL':
        this.applyMinimalMode();
        break;
      case 'BEGINNER':
        this.applyBeginnerMode();
        break;
      case 'NONE':
      default:
        break;
    }
  }

  private applyReaderMode(): void {
    this.hideNoisyElements([
      'aside', '.sidebar', '#sidebar', '.ad', '.ads', '.banner',
      'header nav', 'footer', '.popup', '.modal', '.social-share'
    ]);

    const css = `
      body {
        max-width: 800px !important;
        margin: 0 auto !important;
        padding: 24px !important;
        font-family: system-ui, -apple-system, sans-serif !important;
        line-height: 1.7 !important;
        color: #1e293b !important;
        background-color: #f8fafc !important;
      }
      main, article, .content, #content {
        max-width: 100% !important;
        margin: 0 auto !important;
      }
      h1, h2, h3 { color: #0f172a !important; margin-top: 1.5em !important; }
      p { margin-bottom: 1.25em !important; font-size: 1.125rem !important; }
    `;
    this.cssInjector.injectCSS('simplification-reader', css);
  }

  private applyFocusMode(): void {
    const css = `
      header, footer, aside, nav, .ad, .banner {
        opacity: 0.25 !important;
        filter: grayscale(80%) blur(1px) !important;
        transition: all 0.3s ease !important;
      }
      header:hover, footer:hover, aside:hover, nav:hover {
        opacity: 1 !important;
        filter: none !important;
      }
      main, article, form, .main-content {
        box-shadow: 0 0 40px rgba(56, 189, 248, 0.25) !important;
        border-radius: 12px !important;
        padding: 16px !important;
      }
    `;
    this.cssInjector.injectCSS('simplification-focus', css);
  }

  private applyMinimalMode(): void {
    this.hideNoisyElements([
      'header', 'footer', 'aside', 'nav', '.ad', '.banner', '.comments', '.related'
    ]);
    const css = `
      body {
        background: #ffffff !important;
        color: #111827 !important;
        margin: 0 auto !important;
        padding: 20px !important;
      }
    `;
    this.cssInjector.injectCSS('simplification-minimal', css);
  }

  private applyBeginnerMode(): void {
    const complexInputs = document.querySelectorAll('input[name*="aadhaar" i], input[name*="pan" i], input[type="file"], input[name*="ifsc" i]');
    complexInputs.forEach((input, idx) => {
      const parent = input.parentElement || document.body;
      const helperBadge = document.createElement('div');
      helperBadge.className = 'sahayak-beginner-guide';
      helperBadge.setAttribute('data-sahayak-badge', 'true');
      helperBadge.style.cssText = `
        background-color: rgba(2, 132, 199, 0.1);
        border-left: 3px solid #0284c7;
        color: #0369a1;
        font-size: 11px;
        padding: 4px 8px;
        margin: 4px 0;
        border-radius: 4px;
        font-family: system-ui, sans-serif;
      `;
      helperBadge.textContent = `💡 Beginner Help (${idx + 1}): Ensure document details match your official ID exactly.`;
      parent.insertBefore(helperBadge, input);
      this.injectedBadges.push(helperBadge);
    });
  }

  private hideNoisyElements(selectors: string[]): void {
    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        const htmlEl = el as HTMLElement;
        if (htmlEl.style.display !== 'none') {
          htmlEl.setAttribute('data-sahayak-simplification-hidden', htmlEl.style.display || 'block');
          htmlEl.style.setProperty('display', 'none', 'important');
          this.hiddenElements.push(htmlEl);
        }
      });
    });
  }

  private disableAll(): void {
    ['reader', 'focus', 'minimal'].forEach((key) => {
      this.cssInjector.removeCSS(`simplification-${key}`);
    });

    this.hiddenElements.forEach((el) => {
      const prevDisplay = el.getAttribute('data-sahayak-simplification-hidden');
      el.style.display = prevDisplay === 'block' ? '' : prevDisplay || '';
      el.removeAttribute('data-sahayak-simplification-hidden');
    });
    this.hiddenElements = [];

    this.injectedBadges.forEach((badge) => badge.remove());
    this.injectedBadges = [];

    this.currentMode = 'NONE';
  }

  public getCurrentMode(): SimplificationMode {
    return this.currentMode;
  }

  public getIsActive(): boolean {
    return this.currentMode !== 'NONE';
  }
}
