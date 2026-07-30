import { z } from 'zod';

export const UIActionSchema = z
  .object({
    id: z.string().optional(),
    type: z.enum([
      'HIGHLIGHT_ELEMENT',
      'HIDE_ELEMENT',
      'SIMPLIFY_TEXT',
      'INJECT_CSS',
      'ACCESSIBILITY_ENHANCE',
      'REORDER_EMPHASIS',
      'AUTOFILL_FORM',
    ]),
    selector: z.string().min(1),
    reasoning: z.string().min(1).max(300),
    confidence: z.number().min(0).max(1).default(0.9),
    color: z.string().optional(),
    cssPatch: z.string().max(1000).optional(),
    simplifiedContent: z.string().max(500).optional(),
    originalTextSnippet: z.string().optional(),
    fieldValues: z.record(z.string()).optional(),
    fontSizeIncreasePx: z.number().optional(),
    contrastRatio: z.number().optional(),
    priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  })
  .superRefine((val, ctx) => {
    if (val.type === 'INJECT_CSS' && !val.cssPatch) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'cssPatch is required when action type is INJECT_CSS',
      });
    }
    if (val.type === 'SIMPLIFY_TEXT' && !val.simplifiedContent) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'simplifiedContent is required when action type is SIMPLIFY_TEXT',
      });
    }
  });

export const PageAdaptationManifestSchema = z.object({
  version: z.string().default('1.0'),
  pageUrl: z.string(),
  summary: z.string().max(400),
  uxIssues: z.array(z.string()).max(10).optional(),
  actions: z.array(UIActionSchema).max(12),
});

export type UIAction = z.infer<typeof UIActionSchema>;
export type PageAdaptationManifest = z.infer<typeof PageAdaptationManifestSchema>;
