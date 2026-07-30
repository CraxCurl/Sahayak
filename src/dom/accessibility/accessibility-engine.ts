import { CSSInjector } from '../css-injector/css-injector';

export interface AccessibilityConfig {
  highContrast: boolean;
  fontSizeScale: number; // e.g. 1.0, 1.25, 1.5
  letterSpacingPx: number;
  enhanceFocus: boolean;
  reducedMotion: boolean;
}

export class AccessibilityEngine {
  private cssInjector: CSSInjector;
  private isHighContrastActive = false;
  private isReducedMotionActive = false;
  private currentFontScale = 1.0;

  constructor(cssInjector?: CSSInjector) {
    this.cssInjector = cssInjector || new CSSInjector();
  }

  /**
   * Toggle High Contrast Mode on the target document.
   */
  public setHighContrast(enable: boolean): void {
    this.isHighContrastActive = enable;
    if (enable) {
      const highContrastCSS = `
        html.sahayak-hc, html.sahayak-hc body {
          background-color: #0f172a !important;
          color: #f8fafc !important;
        }
        html.sahayak-hc p, html.sahayak-hc span, html.sahayak-hc li, html.sahayak-hc label {
          color: #f1f5f9 !important;
        }
        html.sahayak-hc a {
          color: #38bdf8 !important;
          text-decoration: underline !important;
        }
        html.sahayak-hc button, html.sahayak-hc input[type="submit"], html.sahayak-hc input[type="button"] {
          background-color: #0284c7 !important;
          color: #ffffff !important;
          border: 2px solid #38bdf8 !important;
          font-weight: bold !important;
        }
        html.sahayak-hc input, html.sahayak-hc textarea, html.sahayak-hc select {
          background-color: #1e293b !important;
          color: #ffffff !important;
          border: 2px solid #64748b !important;
        }
      `;
      document.documentElement.classList.add('sahayak-hc');
      this.cssInjector.injectCSS('high-contrast-mode', highContrastCSS);
    } else {
      document.documentElement.classList.remove('sahayak-hc');
      this.cssInjector.removeCSS('high-contrast-mode');
    }
  }

  /**
   * Adjust font scaling factor across document text elements.
   */
  public setFontScale(scale: number): void {
    this.currentFontScale = scale;
    if (scale <= 1.0) {
      this.cssInjector.removeCSS('font-scale-override');
      return;
    }

    // Limit maximum scale to 1.15 (15% max increase) to keep layout clean and readable
    const clampedScale = Math.min(scale, 1.15);
    const fontCSS = `
      body {
        font-size: calc(100% * ${clampedScale}) !important;
        line-height: 1.6 !important;
      }
    `;
    this.cssInjector.injectCSS('font-scale-override', fontCSS);
  }

  /**
   * Toggle Reduced Motion across webpage transitions and keyframes.
   */
  public setReducedMotion(enable: boolean): void {
    this.isReducedMotionActive = enable;
    if (enable) {
      const motionCSS = `
        *, ::before, ::after {
          animation-duration: 0.001s !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.001s !important;
          scroll-behavior: auto !important;
        }
      `;
      this.cssInjector.injectCSS('reduced-motion-override', motionCSS);
    } else {
      this.cssInjector.removeCSS('reduced-motion-override');
    }
  }

  /**
   * Enhance keyboard focus outlines for accessibility compliance.
   */
  public setEnhancedFocus(enable: boolean): void {
    if (enable) {
      const focusCSS = `
        *:focus-visible {
          outline: 4px solid #38bdf8 !important;
          outline-offset: 3px !important;
          box-shadow: 0 0 0 6px rgba(56, 189, 248, 0.4) !important;
        }
      `;
      this.cssInjector.injectCSS('enhanced-focus', focusCSS);
    } else {
      this.cssInjector.removeCSS('enhanced-focus');
    }
  }

  /**
   * Apply missing ARIA label fixes provided by AI.
   */
  public applyAriaFixes(fixes: Record<string, string>): void {
    Object.entries(fixes).forEach(([selector, ariaLabel]) => {
      document.querySelectorAll(selector).forEach((el) => {
        el.setAttribute('aria-label', ariaLabel);
        el.setAttribute('data-sahayak-aria-fixed', 'true');
      });
    });
  }

  /**
   * Reset all accessibility modifications.
   */
  public resetAll(): void {
    this.setHighContrast(false);
    this.setFontScale(1.0);
    this.setEnhancedFocus(false);
    this.setReducedMotion(false);

    document.querySelectorAll('[data-sahayak-aria-fixed]').forEach((el) => {
      el.removeAttribute('aria-label');
      el.removeAttribute('data-sahayak-aria-fixed');
    });
  }

  public isContrastActive(): boolean {
    return this.isHighContrastActive;
  }

  public isMotionReduced(): boolean {
    return this.isReducedMotionActive;
  }

  public getFontScale(): number {
    return this.currentFontScale;
  }
}
