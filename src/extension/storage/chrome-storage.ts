export class ChromeStorageService {
  public static get<T>(key: string, defaultValue: T): Promise<T> {
    return new Promise(resolve => {
      chrome.storage.local.get([key], items => {
        resolve(items[key] !== undefined ? (items[key] as T) : defaultValue);
      });
    });
  }

  public static set<T>(key: string, value: T): Promise<void> {
    return new Promise(resolve => {
      chrome.storage.local.set({ [key]: value }, () => {
        resolve();
      });
    });
  }
}
