import { z } from 'zod';

export const DOMActionTypeSchema = z.enum([
  'HIGHLIGHT_ELEMENT',
  'HIDE_ELEMENT',
  'SIMPLIFY_TEXT',
  'INJECT_CSS',
  'AUTOFILL_FORM',
  'ACCESSIBILITY_ENHANCE',
]);

export const BaseActionSchema = z.object({
  id: z.string(),
  type: DOMActionTypeSchema,
  selector: z.string(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().optional(),
});

export const HighlightActionSchema = BaseActionSchema.extend({
  type: z.literal('HIGHLIGHT_ELEMENT'),
  color: z.string().default('#38bdf8'),
  label: z.string().optional(),
});

export const HideActionSchema = BaseActionSchema.extend({
  type: z.literal('HIDE_ELEMENT'),
});

export const SimplifyTextActionSchema = BaseActionSchema.extend({
  type: z.literal('SIMPLIFY_TEXT'),
  originalTextSnippet: z.string(),
  simplifiedContent: z.string(),
});

export const InjectCSSActionSchema = BaseActionSchema.extend({
  type: z.literal('INJECT_CSS'),
  cssRules: z.string(),
  scopeId: z.string(),
});

export const AutofillActionSchema = BaseActionSchema.extend({
  type: z.literal('AUTOFILL_FORM'),
  fieldValues: z.record(z.string(), z.string()),
});

export const AccessibilityEnhanceActionSchema = BaseActionSchema.extend({
  type: z.literal('ACCESSIBILITY_ENHANCE'),
  contrastRatio: z.number().optional(),
  fontSizeIncreasePx: z.number().optional(),
  ariaLabelFixes: z.record(z.string(), z.string()).optional(),
});

export const SahayakActionSchema = z.discriminatedUnion('type', [
  HighlightActionSchema,
  HideActionSchema,
  SimplifyTextActionSchema,
  InjectCSSActionSchema,
  AutofillActionSchema,
  AccessibilityEnhanceActionSchema,
]);

export const SahayakActionManifestZodSchema = z.object({
  version: z.string().default('1.0'),
  pageUrl: z.string(),
  summary: z.string(),
  actions: z.array(SahayakActionSchema),
});

export const ChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  timestamp: z.number(),
});

export const ChatResponseSchema = z.object({
  reply: z.string(),
  suggestedActions: z.array(SahayakActionSchema).optional(),
});

export type SahayakActionSchemaType = z.infer<typeof SahayakActionSchema>;
export type SahayakActionManifestSchemaType = z.infer<typeof SahayakActionManifestZodSchema>;
export type ChatMessageSchemaType = z.infer<typeof ChatMessageSchema>;
export type ChatResponseSchemaType = z.infer<typeof ChatResponseSchema>;
