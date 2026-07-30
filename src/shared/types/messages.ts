import { SahayakActionManifest } from './ai-actions';

export type MessageType =
  | 'DOM_ANALYZE_PAGE'
  | 'DOM_PAGE_ANALYZED'
  | 'AI_RUN_ANALYSIS'
  | 'AI_ACTIONS_READY'
  | 'SETTINGS_UPDATE'
  | 'PING_BACKGROUND';

export interface MessagePayloadMap {
  DOM_ANALYZE_PAGE: { pageUrl: string; forceFresh?: boolean };
  DOM_PAGE_ANALYZED: { pageUrl: string; textSummary: string; formCount: number; interactiveSelectors: string[] };
  AI_RUN_ANALYSIS: { textSummary: string; userPreferences: Record<string, unknown> };
  AI_ACTIONS_READY: { manifest: SahayakActionManifest };
  SETTINGS_UPDATE: { theme: 'light' | 'dark'; gemmaApiKey: string };
  PING_BACKGROUND: { timestamp: number };
}

export interface ExtensionMessage<T extends MessageType = MessageType> {
  type: T;
  payload: MessagePayloadMap[T];
  senderTabId?: number;
}
