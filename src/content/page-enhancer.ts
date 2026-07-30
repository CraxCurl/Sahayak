import { AccessibilitySettings } from '../types/index';

export class PageEnhancer {
  private styleElement: HTMLStyleElement | null = null;

  constructor() {
    this.ensureStyleElement();
  }

  private ensureStyleElement() {
    if (!this.styleElement || !document.head.contains(this.styleElement)) {
      this.styleElement = document.createElement('style');
      this.styleElement.id = 'sahayak-accessibility-styles';
      (document.head || document.documentElement).appendChild(this.styleElement);
    }
  }

  public applySettings(settings: AccessibilitySettings) {
    this.ensureStyleElement();
    if (!this.styleElement) return;

    let css = '';

    if (!settings.enabled) {
      this.styleElement.textContent = '';
      document.body?.classList.remove('sahayak-high-contrast', 'sahayak-dyslexia-font', 'sahayak-reader-mode');
      return;
    }

    // High Contrast Mode
    if (settings.highContrast) {
      document.body?.classList.add('sahayak-high-contrast');
      css += `
        body.sahayak-high-contrast {
          background-color: #000000 !important;
          color: #ffffff !important;
        }
        body.sahayak-high-contrast p,
        body.sahayak-high-contrast span,
        body.sahayak-high-contrast div,
        body.sahayak-high-contrast h1,
        body.sahayak-high-contrast h2,
        body.sahayak-high-contrast h3,
        body.sahayak-high-contrast h4,
        body.sahayak-high-contrast h5,
        body.sahayak-high-contrast h6,
        body.sahayak-high-contrast li,
        body.sahayak-high-contrast label {
          color: #ffffff !important;
        }
        body.sahayak-high-contrast a {
          color: #60a5fa !important;
          text-decoration: underline !important;
        }
        body.sahayak-high-contrast input,
        body.sahayak-high-contrast textarea,
        body.sahayak-high-contrast select {
          background-color: #111827 !important;
          color: #ffffff !important;
          border: 2px solid #60a5fa !important;
        }
      `;
    } else {
      document.body?.classList.remove('sahayak-high-contrast');
    }

    // Dyslexia-Friendly Typography
    if (settings.dyslexiaFont) {
      document.body?.classList.add('sahayak-dyslexia-font');
      css += `
        body.sahayak-dyslexia-font,
        body.sahayak-dyslexia-font p,
        body.sahayak-dyslexia-font span,
        body.sahayak-dyslexia-font h1,
        body.sahayak-dyslexia-font h2,
        body.sahayak-dyslexia-font h3,
        body.sahayak-dyslexia-font li,
        body.sahayak-dyslexia-font label {
          font-family: 'Open Sans', 'Comic Sans MS', sans-serif !important;
          letter-spacing: 0.05em !important;
          word-spacing: 0.1em !important;
        }
      `;
    } else {
      document.body?.classList.remove('sahayak-dyslexia-font');
    }

    // Custom Font Scale & Line Spacing
    if (settings.fontScale !== 100 || settings.lineSpacing !== 1.2) {
      const scaleMultiplier = settings.fontScale / 100;
      css += `
        body p, body li, body span, body label, body input, body textarea {
          font-size: calc(100% * ${scaleMultiplier}) !important;
          line-height: ${settings.lineSpacing} !important;
        }
      `;
    }

    // Remove Clutter Mode
    if (settings.removeClutter) {
      css += `
        aside,
        .ad, .ads, .banner-ad, .sidebar-ad,
        [role="banner"], [role="complementary"],
        iframe[src*="doubleclick"], iframe[src*="ad"] {
          display: none !important;
        }
      `;
    }

    // Focus Reader Mode
    if (settings.readerMode) {
      document.body?.classList.add('sahayak-reader-mode');
      css += `
        body.sahayak-reader-mode > *:not(main):not(#root):not(#__next) {
          opacity: 0.8;
        }
        main, article, .content, #content {
          max-width: 850px !important;
          margin: 0 auto !important;
          padding: 24px !important;
          box-shadow: 0 0 30px rgba(0,0,0,0.15) !important;
        }
      `;
    } else {
      document.body?.classList.remove('sahayak-reader-mode');
    }

    this.styleElement.textContent = css;
  }
}
