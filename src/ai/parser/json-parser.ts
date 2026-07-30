import { SahayakActionManifestZodSchema } from '../schemas/action-schema';
import { SahayakActionManifest } from '@shared/types/ai-actions';

export function parseAndValidateGemmaOutput(rawOutput: string): SahayakActionManifest {
  // Strip markdown fenced code blocks if present
  let cleaned = rawOutput.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
  }

  try {
    const rawJson = JSON.parse(cleaned);
    return SahayakActionManifestZodSchema.parse(rawJson) as SahayakActionManifest;
  } catch (error) {
    console.error('[Sahayak AI Parser] Schema validation failed:', error);
    throw new Error(`Failed to parse Gemma output into valid Sahayak action manifest: ${String(error)}`);
  }
}
