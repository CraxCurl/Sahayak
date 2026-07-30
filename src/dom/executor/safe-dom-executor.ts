import { PageAdaptationManifest, UIAction } from '../../ai/schemas/page-adaptation.schema';
import { CSSInjector } from '../css-injector/css-injector';
import { AccessibilityEngine } from '../accessibility/accessibility-engine';
import { OriginalContentMap } from './original-content-map';

export class SafeDOMExecutor {
  private cssInjector: CSSInjector;
  private accessibilityEngine: AccessibilityEngine;
  private originalContentMap: OriginalContentMap;

  constructor() {
    this.cssInjector = new CSSInjector();
    this.accessibilityEngine = new AccessibilityEngine(this.cssInjector);
    this.originalContentMap = new OriginalContentMap();
  }

  public getCSSInjector(): CSSInjector {
    return this.cssInjector;
  }

  public getAccessibilityEngine(): AccessibilityEngine {
    return this.accessibilityEngine;
  }

  public executeManifest(manifest: PageAdaptationManifest): void {
    console.log('[SafeDOMExecutor] Executing action manifest:', manifest.summary);
    this.cssInjector.injectBaseStyles();

    for (const action of manifest.actions) {
      this.executeSingleAction(action);
    }
  }

  public executeSingleAction(action: UIAction): void {
    try {
      const elements = Array.from(document.querySelectorAll<HTMLElement>(action.selector));

      if (elements.length === 0) {
        console.warn(`[SafeDOMExecutor] Target selector not found: "${action.selector}"`);
        return;
      }

      elements.forEach(el => {
        this.originalContentMap.save(el);

        switch (action.type) {
          case 'HIGHLIGHT_ELEMENT':
            el.classList.add('sahayak-highlighted-element');
            if (action.color) {
              el.style.outline = `3px solid ${action.color}`;
            }
            break;

          case 'HIDE_ELEMENT':
            el.style.display = 'none';
            break;

          case 'SIMPLIFY_TEXT':
            if (action.simplifiedContent) {
              el.innerHTML = `<span class="sahayak-simplified-badge" title="${action.reasoning}">💡 ${action.simplifiedContent}</span>`;
            }
            break;

          case 'INJECT_CSS':
            if (action.cssPatch) {
              this.cssInjector.injectCSS(`action-${Date.now()}`, action.cssPatch);
            }
            break;

          case 'AUTOFILL_FORM':
            if (action.fieldValues) {
              Object.entries(action.fieldValues).forEach(([fieldSel, val]) => {
                const inputEl = document.querySelector<HTMLInputElement>(fieldSel);
                if (inputEl) {
                  inputEl.value = val;
                  inputEl.classList.add('sahayak-autofilled-field');
                }
              });
            }
            break;

          case 'ACCESSIBILITY_ENHANCE':
            if (action.fontSizeIncreasePx) {
              this.accessibilityEngine.setFontScale(1 + action.fontSizeIncreasePx / 16);
            }
            break;

          default:
            console.log(`[SafeDOMExecutor] Unhandled action type: ${(action as any).type}`);
        }
      });
    } catch (err) {
      console.error(`[SafeDOMExecutor] Error executing action on "${action.selector}":`, err);
    }
  }

  public highlightAndScrollTo(selector: string, color = '#38bdf8'): void {
    try {
      const els = document.querySelectorAll<HTMLElement>(selector);
      if (els.length > 0) {
        const first = els[0];
        first.scrollIntoView({ behavior: 'smooth', block: 'center' });
        els.forEach(el => {
          this.originalContentMap.save(el);
          el.classList.add('sahayak-highlighted-element');
          el.style.outline = `4px solid ${color}`;
          el.style.boxShadow = `0 0 25px ${color}`;
          setTimeout(() => {
            el.style.outline = '';
            el.style.boxShadow = '';
            el.classList.remove('sahayak-highlighted-element');
          }, 4000);
        });
      }
    } catch (err) {
      console.warn(`[SafeDOMExecutor] Could not highlight selector "${selector}":`, err);
    }
  }

  public revertAll(): void {
    console.log('[SafeDOMExecutor] Reverting all DOM changes...');
    this.originalContentMap.revertAll();
    this.cssInjector.clearAllInjections();
    this.accessibilityEngine.resetAll();
  }
}
