/**
 * message-router.js — Chrome APIs · Typed IPC Message Router
 *
 * Dev 1 scope: Message Router.
 * Wraps `chrome.runtime.sendMessage` and `chrome.tabs.sendMessage` with Promises
 * and a typed message contract.
 */

export const MessageType = Object.freeze({
  EXTRACT_DOM: 'EXTRACT_DOM',
  DOM_EXTRACTED: 'DOM_EXTRACTED',
  PING_BACKGROUND: 'PING_BACKGROUND',
});

export class MessageRouter {
  /** Send a message to the background service worker. */
  static send(message) {
    return new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendMessage(message, response => {
          if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
          resolve(response);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  /** Send a message to a specific tab's content script. */
  static sendToTab(tabId, message) {
    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tabId, message, response => {
        if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
        resolve(response);
      });
    });
  }

  /** Ask the active tab's content script to extract DOM data. */
  static async extractActiveTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) throw new Error('No active tab found.');
    return this.sendToTab(tab.id, { type: MessageType.EXTRACT_DOM });
  }

  /** Forward an extracted payload to the AI module via the background worker. */
  static async forwardToAI(payload) {
    return this.send({ type: MessageType.DOM_EXTRACTED, payload });
  }

  /** Liveness ping — drives the popup status dot. */
  static async ping() {
    return this.send({ type: MessageType.PING_BACKGROUND, payload: { timestamp: Date.now() } });
  }
}
