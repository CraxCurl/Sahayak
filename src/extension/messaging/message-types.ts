import { PageAdaptationManifest } from '../../ai/schemas/page-adaptation.schema';

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

export type ExtensionMessage =
  | { type: 'DOM_ANALYZE_PAGE'; payload: { pageUrl: string; forceFresh?: boolean } }
  | { type: 'DOM_PAGE_ANALYZED'; payload: ExtractedPageData }
  | { type: 'AI_RUN_ANALYSIS'; payload: { textSummary: string; userPreferences: Record<string, unknown> } }
  | { type: 'AI_ACTIONS_READY'; payload: { manifest: PageAdaptationManifest } }
  | { type: 'SETTINGS_UPDATE'; payload: { theme: 'light' | 'dark'; gemmaApiKey?: string } }
  | { type: 'PING_BACKGROUND'; payload: { timestamp: number } }
  | { type: 'CHAT_QUERY_REQUEST'; payload: { question: string; pageUrl: string; textSummary: string } }
  | { type: 'CHAT_QUERY_RESPONSE'; payload: { answer: string; highlightSelector?: string } }
  | { type: 'HIGHLIGHT_TARGET_ELEMENT'; payload: { selector: string; label?: string } }
  | { type: 'SAHAYAK_TOGGLE_STATE'; payload: { active: boolean } };
