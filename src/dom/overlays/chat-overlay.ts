import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { ChatAssistant } from '@forms/assistant/ChatAssistant';

export class ChatOverlayManager {
  private shadowHost: HTMLElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private reactRoot: Root | null = null;

  public mount(): void {
    if (this.shadowHost) return;

    this.shadowHost = document.createElement('div');
    this.shadowHost.id = 'sahayak-chat-shadow-host';
    this.shadowHost.style.cssText = `
      position: fixed;
      bottom: 0;
      right: 0;
      z-index: 2147483647;
      pointer-events: auto;
    `;

    this.shadowRoot = this.shadowHost.attachShadow({ mode: 'open' });

    // Inject Tailwind/styles into Shadow DOM
    const styleTag = document.createElement('style');
    styleTag.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      :host {
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
      }
      *, ::before, ::after {
        box-sizing: border-box;
      }
    `;
    this.shadowRoot.appendChild(styleTag);

    const container = document.createElement('div');
    container.id = 'sahayak-chat-container';
    this.shadowRoot.appendChild(container);

    document.body.appendChild(this.shadowHost);
    this.reactRoot = createRoot(container);
    this.reactRoot.render(React.createElement(ChatAssistant, { onClose: () => this.unmount() }));
  }

  public unmount(): void {
    if (this.reactRoot) {
      this.reactRoot.unmount();
      this.reactRoot = null;
    }
    if (this.shadowHost) {
      this.shadowHost.remove();
      this.shadowHost = null;
      this.shadowRoot = null;
    }
  }
}
