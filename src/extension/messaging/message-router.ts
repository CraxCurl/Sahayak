import { ExtensionMessage, ExtractedPageData } from '@shared/types/messages';

export class MessageRouter {
  public static sendMessage(message: ExtensionMessage): Promise<unknown> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, response => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  }

  public static sendToTab(tabId: number, message: ExtensionMessage): Promise<unknown> {
    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tabId, message, response => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  }

  public static async extractActiveTab(): Promise<unknown> {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // If the active tab is an extension page (like the dashboard), find the last active web tab
    if (tab?.url?.startsWith('chrome-extension://')) {
      const allTabs = await chrome.tabs.query({ currentWindow: true });
      tab = allTabs
        .filter(t => t.url && !t.url.startsWith('chrome-extension://') && !t.url.startsWith('chrome://'))
        .sort((a, b) => (b.id || 0) - (a.id || 0))[0] || tab;
    }

    if (!tab || !tab.id) {
      throw new Error('No active web tab found.');
    }

    try {
      return await this.sendToTab(tab.id, {
        type: 'DOM_ANALYZE_PAGE',
        payload: { pageUrl: tab.url || '' },
      });
    } catch (err: any) {
      // If content script is not loaded, try to inject it manually
      if (err.message.includes('Could not establish connection') || err.message.includes('Receiving end does not exist')) {
        console.log('[MessageRouter] Content script not found, attempting manual injection...');

        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id! },
            files: ['src/extension/content/content-script.ts']
          });

          // Wait for injection
          await new Promise(resolve => setTimeout(resolve, 500));

          return await this.sendToTab(tab.id!, {
            type: 'DOM_ANALYZE_PAGE',
            payload: { pageUrl: tab.url || '' },
          });
        } catch (injectionErr) {
          console.error('[MessageRouter] Injection failed:', injectionErr);
          throw new Error('Could not communicate with the page. Please reload the tab and try again.');
        }
      }
      throw err;
    }
  }

  public static async forwardToAI(
    payload: ExtractedPageData,
    userPreferences: Record<string, unknown> = { adaptLayout: true, highlightButtons: true }
  ): Promise<unknown> {
    const headingsStr = (payload.headings || []).join(' | ');
    const buttonsStr = (payload.buttons || []).join(', ');
    const inputsStr = (payload.inputs || []).join(', ');
    const formsLen = (payload.forms || []).length;
    const textPreview = (payload.text || '').slice(0, 1500);

    const formattedSummary = `URL: ${payload.url}
Title: ${payload.title}
Headings: ${headingsStr}
Buttons: ${buttonsStr}
Inputs: ${inputsStr}
Forms Count: ${formsLen}
Visible Text: ${textPreview}`;

    return this.sendMessage({
      type: 'AI_RUN_ANALYSIS',
      payload: {
        textSummary: formattedSummary,
        userPreferences,
      },
    });
  }

  public static ping(): Promise<unknown> {
    return this.sendMessage({
      type: 'PING_BACKGROUND',
      payload: { timestamp: Date.now() },
    });
  }
}
