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
  DOM_PAGE_ANALYZED: {
    pageUrl: string;
    textSummary: string;
    formCount: number;
    interactiveSelectors: string[];
  };
  AI_RUN_ANALYSIS: { textSummary: string; userPreferences: Record<string, unknown> };
  AI_ACTIONS_READY: { manifest: SahayakActionManifest };
  SETTINGS_UPDATE: { theme: 'light' | 'dark'; gemmaApiKey: string };
  PING_BACKGROUND: { timestamp: number };
}

export type ExtensionMessage =
  | {
      type: 'DOM_ANALYZE_PAGE';
      payload: MessagePayloadMap['DOM_ANALYZE_PAGE'];
      senderTabId?: number;
    }
  | {
      type: 'DOM_PAGE_ANALYZED';
      payload: MessagePayloadMap['DOM_PAGE_ANALYZED'];
      senderTabId?: number;
    }
  | { type: 'AI_RUN_ANALYSIS'; payload: MessagePayloadMap['AI_RUN_ANALYSIS']; senderTabId?: number }
  | {
      type: 'AI_ACTIONS_READY';
      payload: MessagePayloadMap['AI_ACTIONS_READY'];
      senderTabId?: number;
    }
  | { type: 'SETTINGS_UPDATE'; payload: MessagePayloadMap['SETTINGS_UPDATE']; senderTabId?: number }
  | {
      type: 'PING_BACKGROUND';
      payload: MessagePayloadMap['PING_BACKGROUND'];
      senderTabId?: number;
    };
