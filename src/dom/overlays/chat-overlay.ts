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

    // Inject styles and Tailwind CSS rules into Shadow DOM to prevent transparency
    const styleTag = document.createElement('style');
    styleTag.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      :host {
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        color-scheme: dark;
      }
      *, ::before, ::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      #sahayak-chat-container {
        background-color: #020617 !important;
        color: #f8fafc !important;
        border-radius: 16px;
      }
      /* Utility classes fallback inside Shadow DOM */
      .bg-slate-950\\/95, .bg-slate-950 { background-color: #020617 !important; }
      .bg-slate-900\\/90, .bg-slate-900\\/95, .bg-slate-900 { background-color: #0f172a !important; }
      .bg-slate-900\\/50 { background-color: rgba(15, 23, 42, 0.8) !important; }
      .bg-slate-800\\/80, .bg-slate-800 { background-color: #1e293b !important; }
      .bg-sky-600 { background-color: #0284c7 !important; }
      .bg-emerald-400 { background-color: #34d399 !important; }
      .border-slate-800\\/80, .border-slate-800 { border-color: #1e293b !important; }
      .border-slate-700\\/50 { border-color: #334155 !important; }
      .text-slate-100 { color: #f8fafc !important; }
      .text-slate-200 { color: #e2e8f0 !important; }
      .text-slate-300 { color: #cbd5e1 !important; }
      .text-slate-400 { color: #94a3b8 !important; }
      .text-slate-500 { color: #64748b !important; }
      .text-sky-300 { color: #7dd3fc !important; }
      .text-sky-400 { color: #38bdf8 !important; }
      .text-indigo-400 { color: #818cf8 !important; }
      .text-emerald-300 { color: #6ee7b7 !important; }
      .text-white { color: #ffffff !important; }
      .flex { display: flex !important; }
      .flex-col { flex-direction: column !important; }
      .flex-1 { flex: 1 1 0% !important; }
      .items-center { align-items: center !important; }
      .justify-between { justify-content: space-between !important; }
      .gap-1 { gap: 0.25rem !important; }
      .gap-1\\.5 { gap: 0.375rem !important; }
      .gap-2 { gap: 0.5rem !important; }
      .gap-2\\.5 { gap: 0.625rem !important; }
      .gap-3 { gap: 0.75rem !important; }
      .gap-3\\.5 { gap: 0.875rem !important; }
      .p-1\\.5 { padding: 0.375rem !important; }
      .p-2 { padding: 0.5rem !important; }
      .p-2\\.5 { padding: 0.625rem !important; }
      .p-3 { padding: 0.75rem !important; }
      .p-3\\.5 { padding: 0.875rem !important; }
      .px-2\\.5 { padding-left: 0.625rem !important; padding-right: 0.625rem !important; }
      .px-3 { padding-left: 0.75rem !important; padding-right: 0.75rem !important; }
      .px-4 { padding-left: 1rem !important; padding-right: 1rem !important; }
      .py-1 { padding-top: 0.25rem !important; padding-bottom: 0.25rem !important; }
      .py-2 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
      .py-3 { padding-top: 0.75rem !important; padding-bottom: 0.75rem !important; }
      .rounded-xl { border-radius: 0.75rem !important; }
      .rounded-2xl { border-radius: 1rem !important; }
      .rounded-full { border-radius: 9999px !important; }
      .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7) !important; }
      .w-96 { width: 24rem !important; }
      .h-\\[540px\\] { height: 540px !important; }
      .overflow-hidden { overflow: hidden !important; }
      .overflow-y-auto { overflow-y: auto !important; }
      .fixed { position: fixed !important; }
      .bottom-6 { bottom: 1.5rem !important; }
      .right-6 { right: 1.5rem !important; }
      .z-\\[99999\\] { z-index: 99999 !important; }
      input[type="text"] {
        background-color: #020617 !important;
        color: #f8fafc !important;
        border: 1px solid #1e293b !important;
        outline: none;
      }
      input[type="text"]:focus {
        border-color: #38bdf8 !important;
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
