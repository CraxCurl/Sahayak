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
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      throw new Error('No active tab found.');
    }
    return this.sendToTab(tab.id, {
      type: 'DOM_ANALYZE_PAGE',
      payload: { pageUrl: tab.url || '' },
    });
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
