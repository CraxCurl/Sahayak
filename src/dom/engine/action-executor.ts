import { SahayakActionManifest, SahayakAction } from '@shared/types/ai-actions';

export class SafeDOMExecutor {
  private originalContentMap: Map<Element, string> = new Map();
  private appliedStyles: Map<string, HTMLStyleElement> = new Map();

  public executeManifest(manifest: SahayakActionManifest): void {
    console.log(`[Sahayak DOM Engine] Executing ${manifest.actions.length} AI actions...`);
    for (const action of manifest.actions) {
      try {
        this.executeSingleAction(action);
      } catch (err) {
        console.error(`[Sahayak DOM Engine] Error applying action ${action.id}:`, err);
      }
    }
  }

  private executeSingleAction(action: SahayakAction): void {
    const targets = document.querySelectorAll(action.selector);
    if (targets.length === 0) return;

    switch (action.type) {
      case 'HIGHLIGHT_ELEMENT':
        targets.forEach(el => {
          (el as HTMLElement).style.outline = `3px solid ${action.color}`;
          (el as HTMLElement).style.outlineOffset = '2px';
          (el as HTMLElement).setAttribute('data-sahayak-highlight', action.id);
        });
        break;

      case 'HIDE_ELEMENT':
        targets.forEach(el => {
          (el as HTMLElement).style.display = 'none';
          (el as HTMLElement).setAttribute('data-sahayak-hidden', 'true');
        });
        break;

      case 'SIMPLIFY_TEXT':
        targets.forEach(el => {
          if (!this.originalContentMap.has(el)) {
            this.originalContentMap.set(el, el.innerHTML);
          }
          el.innerHTML = `<span class="sahayak-simplified" title="Original: ${el.textContent}">${action.simplifiedContent}</span>`;
        });
        break;

      case 'INJECT_CSS':
        this.injectStyle(action.scopeId, action.cssRules);
        break;
    }
  }

  private injectStyle(id: string, cssRules: string): void {
    if (this.appliedStyles.has(id)) return;
    const styleEl = document.createElement('style');
    styleEl.setAttribute('id', `sahayak-style-${id}`);
    styleEl.textContent = cssRules;
    document.head.appendChild(styleEl);
    this.appliedStyles.set(id, styleEl);
  }

  public highlightAndScrollTo(selector: string, color = '#38bdf8'): void {
    try {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) return;

      const firstEl = elements[0] as HTMLElement;
      firstEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

      elements.forEach(el => {
        const htmlEl = el as HTMLElement;
        const origOutline = htmlEl.style.outline;
        const origBoxShadow = htmlEl.style.boxShadow;
        const origTransition = htmlEl.style.transition;

        htmlEl.style.transition = 'all 0.3s ease-in-out';
        htmlEl.style.outline = `4px solid ${color}`;
        htmlEl.style.outlineOffset = '4px';
        htmlEl.style.boxShadow = `0 0 20px ${color}80`;

        setTimeout(() => {
          htmlEl.style.outline = `4px solid ${color}aa`;
          setTimeout(() => {
            htmlEl.style.outline = origOutline;
            htmlEl.style.boxShadow = origBoxShadow;
            htmlEl.style.transition = origTransition;
          }, 3500);
        }, 1500);
      });
    } catch (err) {
      console.warn(`[Sahayak DOM Engine] Could not highlight selector "${selector}":`, err);
    }
  }

  public revertAll(): void {
    this.originalContentMap.forEach((originalHTML, element) => {
      element.innerHTML = originalHTML;
    });
    this.originalContentMap.clear();

    this.appliedStyles.forEach(styleEl => styleEl.remove());
    this.appliedStyles.clear();

    document.querySelectorAll('[data-sahayak-highlight]').forEach(el => {
      (el as HTMLElement).style.outline = '';
      (el as HTMLElement).style.outlineOffset = '';
      el.removeAttribute('data-sahayak-highlight');
    });

    document.querySelectorAll('[data-sahayak-hidden]').forEach(el => {
      (el as HTMLElement).style.display = '';
      el.removeAttribute('data-sahayak-hidden');
    });
  }
}
