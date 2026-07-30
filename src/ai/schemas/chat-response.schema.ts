import { z } from 'zod';

export const ChatResponseSchema = z.object({
  answer: z.string().min(1),
  highlightSelector: z.string().nullable().optional(),
});

export type ChatResponse = z.infer<typeof ChatResponseSchema>;
