import { SahayakActionManifestZodSchema } from '../schemas/action-schema';
import { SahayakActionManifest } from '@shared/types/ai-actions';

/**
 * Strips markdown code blocks and repairs common raw JSON string flaws from model output.
 */
export function cleanRawJsonString(rawOutput: string): string {
  let cleaned = rawOutput.trim();

  // Strip markdown fenced code blocks
  if (cleaned.includes('```')) {
    const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      cleaned = match[1].trim();
    } else {
      cleaned = cleaned
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
    }
  }

  // Extract JSON object if wrapped in conversational text
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  return cleaned;
}

export function parseAndValidateGemmaOutput(rawOutput: string): SahayakActionManifest {
  const cleaned = cleanRawJsonString(rawOutput);

  try {
    const rawJson = JSON.parse(cleaned);
    const parsed = SahayakActionManifestZodSchema.parse(rawJson);
    return parsed as unknown as SahayakActionManifest;
  } catch (error) {
    console.error(
      '[Sahayak AI Parser] Schema validation failed:',
      error,
      '\nRaw input:',
      rawOutput
    );
    throw new Error(
      `Failed to parse Gemma output into valid Sahayak action manifest: ${String(error)}`
    );
  }
}
