import { SahayakActionManifestZodSchema } from '../schemas/action-schema';
import { SahayakActionManifest } from '@shared/types/ai-actions';

/**
 * Strips markdown code blocks, conversational preambles, trailing commas,
 * single-quote keys, and attempts structural repair for truncated model outputs.
 * Satisfies Phase 1, Requirement 1.5 (Robust JSON Extraction).
 */
export function cleanRawJsonString(rawOutput: string): string {
  let cleaned = rawOutput.trim();

  // 1. Strip markdown fenced code blocks (```json ... ``` or ``` ... ```)
  if (cleaned.includes('```')) {
    const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (match && match[1]) {
      cleaned = match[1].trim();
    } else {
      cleaned = cleaned.replace(/```json/gi, '').replace(/```/g, '').trim();
    }
  }

  // 2. Strip conversational preambles ("Here is the JSON:", "Sure, here's the object:")
  const firstBrace = cleaned.indexOf('{');
  if (firstBrace > 0) {
    cleaned = cleaned.substring(firstBrace);
  }

  // 3. Handle truncated objects (if model hit token limit without closing brace)
  let lastBrace = cleaned.lastIndexOf('}');
  if (lastBrace === -1 || lastBrace < firstBrace) {
    // Append missing closing braces
    cleaned += '}';
    lastBrace = cleaned.lastIndexOf('}');
  }

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  // 4. Remove trailing commas before closing braces/brackets (e.g. `{"a": 1,}`)
  cleaned = cleaned.replace(/,\s*([\}\]])/g, '$1');

  // 5. Convert single-quoted keys/values to valid double-quoted JSON strings if needed
  cleaned = cleaned.replace(/([{,]\s*)'([^']+)'\s*:/g, '$1"$2":');

  return cleaned;
}

/**
 * Parses and validates raw Ollama output using Zod schema.
 * Throws explicit schema validation error if JSON structure fails Zod contract.
 */
export function parseAndValidateGemmaOutput(rawOutput: string): SahayakActionManifest {
  const cleaned = cleanRawJsonString(rawOutput);

  try {
    const rawJson = JSON.parse(cleaned);
    const parsed = SahayakActionManifestZodSchema.parse(rawJson);
    return parsed as unknown as SahayakActionManifest;
  } catch (error) {
    console.error(
      '[Sahayak AI Parser] Schema validation / JSON parse error:',
      error,
      '\nCleaned string:',
      cleaned,
      '\nRaw input:',
      rawOutput
    );
    throw new Error(
      `JSON Parse/Schema Validation Failed: ${String(error)}`
    );
  }
}
