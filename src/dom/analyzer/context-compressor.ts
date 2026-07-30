/**
 * Context Compressor (Phase 2 & Part 3, Requirement 3.1).
 * Enforces a strict character/token budget (e.g. 2000 chars) on extracted page context
 * to prevent prompt bloat and keep local Gemma 3 inference fast and low latency.
 */
export function compressContext(rawContext: string, maxChars = 2000): string {
  if (!rawContext || rawContext.length <= maxChars) {
    return rawContext;
  }

  const lines = rawContext.split('\n');
  const compressedLines: string[] = [];
  let currentLength = 0;

  for (const line of lines) {
    if (currentLength + line.length + 1 > maxChars) {
      const remaining = maxChars - currentLength - 20;
      if (remaining > 0) {
        compressedLines.push(line.slice(0, remaining) + '...');
      }
      compressedLines.push('[Context truncated for token budget]');
      break;
    }
    compressedLines.push(line);
    currentLength += line.length + 1;
  }

  return compressedLines.join('\n');
}
