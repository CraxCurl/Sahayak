import { ExtensionMessage } from '@shared/types/messages';

export class MessageRouter {
  public static sendMessage(message: ExtensionMessage): Promise<unknown> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, response => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
  }
}
