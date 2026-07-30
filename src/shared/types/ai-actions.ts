export type DOMActionType =
  | 'HIGHLIGHT_ELEMENT'
  | 'HIDE_ELEMENT'
  | 'SIMPLIFY_TEXT'
  | 'INJECT_CSS'
  | 'AUTOFILL_FORM'
  | 'ACCESSIBILITY_ENHANCE';

export interface BaseDOMAction {
  id: string;
  type: DOMActionType;
  selector: string;
  confidence: number;
  reasoning?: string;
}

export interface HighlightAction extends BaseDOMAction {
  type: 'HIGHLIGHT_ELEMENT';
  color: string;
  label?: string;
}

export interface HideElementAction extends BaseDOMAction {
  type: 'HIDE_ELEMENT';
}

export interface SimplifyTextAction extends BaseDOMAction {
  type: 'SIMPLIFY_TEXT';
  originalTextSnippet: string;
  simplifiedContent: string;
}

export interface InjectCSSAction extends BaseDOMAction {
  type: 'INJECT_CSS';
  cssRules: string;
  scopeId: string;
}

export interface AutofillAction extends BaseDOMAction {
  type: 'AUTOFILL_FORM';
  fieldValues: Record<string, string>;
}

export interface AccessibilityEnhanceAction extends BaseDOMAction {
  type: 'ACCESSIBILITY_ENHANCE';
  contrastRatio?: number;
  fontSizeIncreasePx?: number;
  ariaLabelFixes?: Record<string, string>;
}

export type SahayakAction =
  | HighlightAction
  | HideElementAction
  | SimplifyTextAction
  | InjectCSSAction
  | AutofillAction
  | AccessibilityEnhanceAction;

export interface SahayakActionManifest {
  version: string;
  pageUrl: string;
  summary: string;
  actions: SahayakAction[];
}
