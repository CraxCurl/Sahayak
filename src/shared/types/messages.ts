import { SahayakActionManifest } from './ai-actions';

export interface ExtractedForm {
  id: string;
  name: string;
  action: string;
  method: string;
  fieldCount: number;
}

export interface ExtractedPageData {
  url: string;
  title: string;
  headings: string[];
  buttons: string[];
  inputs: string[];
  forms: ExtractedForm[];
  text: string;
}

export type MessageType =
  | 'DOM_ANALYZE_PAGE'
  | 'DOM_PAGE_ANALYZED'
  | 'AI_RUN_ANALYSIS'
  | 'AI_ACTIONS_READY'
  | 'SETTINGS_UPDATE'
  | 'PING_BACKGROUND'
  | 'CHAT_QUERY_REQUEST'
  | 'CHAT_QUERY_RESPONSE'
  | 'HIGHLIGHT_TARGET_ELEMENT';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  highlightSelector?: string;
}

export interface MessagePayloadMap {
  DOM_ANALYZE_PAGE: { pageUrl: string; forceFresh?: boolean };
  DOM_PAGE_ANALYZED: ExtractedPageData;
  AI_RUN_ANALYSIS: { textSummary: string; userPreferences: Record<string, unknown> };
  AI_ACTIONS_READY: { manifest: SahayakActionManifest };
  SETTINGS_UPDATE: { theme: 'light' | 'dark'; gemmaApiKey: string };
  PING_BACKGROUND: { timestamp: number };
  CHAT_QUERY_REQUEST: { question: string; pageUrl: string; textSummary: string };
  CHAT_QUERY_RESPONSE: { answer: string; highlightSelector?: string };
  HIGHLIGHT_TARGET_ELEMENT: { selector: string; label?: string };
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
    }
  | {
      type: 'CHAT_QUERY_REQUEST';
      payload: MessagePayloadMap['CHAT_QUERY_REQUEST'];
      senderTabId?: number;
    }
  | {
      type: 'CHAT_QUERY_RESPONSE';
      payload: MessagePayloadMap['CHAT_QUERY_RESPONSE'];
      senderTabId?: number;
    }
  | {
      type: 'HIGHLIGHT_TARGET_ELEMENT';
      payload: MessagePayloadMap['HIGHLIGHT_TARGET_ELEMENT'];
      senderTabId?: number;
    };
