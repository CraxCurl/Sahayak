import { SahayakActionManifest, SahayakAction } from '@shared/types/ai-actions';
import { CSSInjector } from '../injector/css-injector';
import { AccessibilityEngine } from '../accessibility/accessibility-engine';

export class SafeDOMExecutor {
  private originalContentMap: WeakMap<Element, string> = new WeakMap();
  private modifiedElements: Element[] = [];
  private cssInjector: CSSInjector;
  private accessibilityEngine: AccessibilityEngine;

  constructor(cssInjector?: CSSInjector, accessibilityEngine?: AccessibilityEngine) {
    this.cssInjector = cssInjector || new CSSInjector();
    this.accessibilityEngine = accessibilityEngine || new AccessibilityEngine(this.cssInjector);
  }

  /**
   * Execute all actions contained in a SahayakActionManifest emitted by Gemma 3.
   */
  public executeManifest(manifest: SahayakActionManifest): void {
    console.log(`[Sahayak DOM Engine] Executing ${manifest.actions.length} AI actions from manifest...`);
    this.cssInjector.injectBaseStyles();

    for (const action of manifest.actions) {
      try {
        this.executeSingleAction(action);
      } catch (err) {
        console.error(`[Sahayak DOM Engine] Failed executing action ${action.id} (${action.type}):`, err);
      }
    }
  }

  /**
   * Dispatch single action to its respective handler.
   */
  public executeSingleAction(action: SahayakAction): void {
    const targets = document.querySelectorAll(action.selector);
    if (targets.length === 0 && action.type !== 'INJECT_CSS' && action.type !== 'ACCESSIBILITY_ENHANCE') {
      console.warn(`[Sahayak DOM Engine] Target selector not found: "${action.selector}"`);
      return;
    }

    switch (action.type) {
      case 'HIGHLIGHT_ELEMENT':
        targets.forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.outline = `3px solid ${action.color || '#38bdf8'}`;
          htmlEl.style.outlineOffset = '2px';
          htmlEl.classList.add('sahayak-highlighted-element');
          htmlEl.setAttribute('data-sahayak-highlight', action.id);
          if (action.label) {
            htmlEl.setAttribute('title', action.label);
          }
          this.trackModifiedElement(el);
        });
        break;

      case 'HIDE_ELEMENT':
        targets.forEach((el) => {
          const htmlEl = el as HTMLElement;
          if (!htmlEl.hasAttribute('data-sahayak-prev-display')) {
            htmlEl.setAttribute('data-sahayak-prev-display', htmlEl.style.display || '');
          }
          htmlEl.style.display = 'none';
          htmlEl.setAttribute('data-sahayak-hidden', 'true');
          this.trackModifiedElement(el);
        });
        break;

      case 'SIMPLIFY_TEXT':
        targets.forEach((el) => {
          if (!this.originalContentMap.has(el)) {
            this.originalContentMap.set(el, el.innerHTML);
          }
          const badgeLabel = action.originalTextSnippet ? ` (Simplified from: "${action.originalTextSnippet.slice(0, 30)}...")` : '';
          el.innerHTML = `<span class="sahayak-simplified-badge" title="Sahayak Simplified Text${badgeLabel}">${action.simplifiedContent}</span>`;
          el.setAttribute('data-sahayak-simplified', 'true');
          this.trackModifiedElement(el);
        });
        break;

      case 'INJECT_CSS':
        this.cssInjector.injectCSS(action.scopeId, action.cssRules);
        break;

      case 'AUTOFILL_FORM':
        if (action.fieldValues) {
          Object.entries(action.fieldValues).forEach(([fieldSelector, value]) => {
            const inputs = document.querySelectorAll(fieldSelector);
            inputs.forEach((inputEl) => {
              if (inputEl instanceof HTMLInputElement || inputEl instanceof HTMLTextAreaElement || inputEl instanceof HTMLSelectElement) {
                inputEl.value = value;
                inputEl.classList.add('sahayak-autofilled-field');
                inputEl.setAttribute('data-sahayak-autofilled', 'true');
                // Trigger change & input events so reactive frameworks (React, Vue) capture updates
                inputEl.dispatchEvent(new Event('input', { bubbles: true }));
                inputEl.dispatchEvent(new Event('change', { bubbles: true }));
                this.trackModifiedElement(inputEl);
              }
            });
          });
        }
        break;

      case 'ACCESSIBILITY_ENHANCE':
        if (action.fontSizeIncreasePx) {
          const currentScale = this.accessibilityEngine.getFontScale();
          this.accessibilityEngine.setFontScale(currentScale + action.fontSizeIncreasePx / 16);
        }
        if (action.contrastRatio && action.contrastRatio > 4.5) {
          this.accessibilityEngine.setHighContrast(true);
        }
        if (action.ariaLabelFixes) {
          this.accessibilityEngine.applyAriaFixes(action.ariaLabelFixes);
        }
        break;
    }
  }

  private trackModifiedElement(el: Element): void {
    if (!this.modifiedElements.includes(el)) {
      this.modifiedElements.push(el);
    }
  }

  /**
   * Revert all applied DOM mutations, injected CSS, text simplifications, and autofills cleanly.
   */
  public revertAll(): void {
    console.log('[Sahayak DOM Engine] Reverting all webpage adaptations...');

    // Revert simplified text nodes
    this.modifiedElements.forEach((el) => {
      if (this.originalContentMap.has(el)) {
        el.innerHTML = this.originalContentMap.get(el)!;
      }
    });

    // Revert highlights
    document.querySelectorAll('[data-sahayak-highlight]').forEach((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.outline = '';
      htmlEl.style.outlineOffset = '';
      htmlEl.classList.remove('sahayak-highlighted-element');
      htmlEl.removeAttribute('data-sahayak-highlight');
      htmlEl.removeAttribute('title');
    });

    // Revert hidden elements
    document.querySelectorAll('[data-sahayak-hidden]').forEach((el) => {
      const htmlEl = el as HTMLElement;
      const prevDisplay = htmlEl.getAttribute('data-sahayak-prev-display');
      htmlEl.style.display = prevDisplay || '';
      htmlEl.removeAttribute('data-sahayak-hidden');
      htmlEl.removeAttribute('data-sahayak-prev-display');
    });

    // Revert autofilled input fields
    document.querySelectorAll('[data-sahayak-autofilled]').forEach((el) => {
      el.classList.remove('sahayak-autofilled-field');
      el.removeAttribute('data-sahayak-autofilled');
    });

    // Clear accessibility & CSS injections
    this.accessibilityEngine.resetAll();
    this.cssInjector.clearAllInjections();

    this.modifiedElements = [];
    console.log('[Sahayak DOM Engine] All adaptations successfully reverted.');
  }

  public getAccessibilityEngine(): AccessibilityEngine {
    return this.accessibilityEngine;
  }

  public getCSSInjector(): CSSInjector {
    return this.cssInjector;
  }
}
