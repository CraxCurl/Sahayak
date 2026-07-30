import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { FloatingToolbar } from './FloatingToolbar';
import { SafeDOMExecutor } from '../engine/action-executor';
import { ReaderMode } from '../reader/reader-mode';

export class ShadowOverlayManager {
  private hostElement: HTMLElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private reactRoot: Root | null = null;

  /**
   * Inject Shadow DOM floating overlay into the current document.
   */
  public mountOverlay(
    executor: SafeDOMExecutor,
    readerMode: ReaderMode,
    onTriggerReanalysis?: () => void
  ): void {
    if (this.hostElement) return; // Already mounted

    this.hostElement = document.createElement('div');
    this.hostElement.id = 'sahayak-overlay-root';
    this.shadowRoot = this.hostElement.attachShadow({ mode: 'open' });

    // Inject Reset Styles into Shadow DOM Root to isolate UI controls completely
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      :host {
        all: initial;
        display: block;
        z-index: 2147483647;
      }
      * {
        box-sizing: border-box;
      }
    `;
    this.shadowRoot.appendChild(styleEl);

    const reactContainer = document.createElement('div');
    this.shadowRoot.appendChild(reactContainer);

    document.body.appendChild(this.hostElement);

    this.reactRoot = createRoot(reactContainer);
    this.reactRoot.render(
      React.createElement(FloatingToolbar, {
        executor,
        readerMode,
        onTriggerReanalysis,
      })
    );

    console.log('[Sahayak Shadow Overlay] Mounted isolated accessibility overlay');
  }

  /**
   * Remove Shadow DOM overlay cleanly.
   */
  public unmountOverlay(): void {
    if (this.reactRoot) {
      this.reactRoot.unmount();
      this.reactRoot = null;
    }
    if (this.hostElement) {
      this.hostElement.remove();
      this.hostElement = null;
      this.shadowRoot = null;
    }
    console.log('[Sahayak Shadow Overlay] Unmounted floating toolbar');
  }
}
