import { describe, it, expect } from 'vitest';
import { compressContext } from '@dom/analyzer/context-compressor';

describe('Context Compressor Tests', () => {
  it('should preserve text within maxChars budget', () => {
    const text = 'Line 1\nLine 2\nLine 3';
    expect(compressContext(text, 100)).toBe(text);
  });

  it('should truncate text exceeding maxChars budget', () => {
    const longText = 'A'.repeat(3000);
    const compressed = compressContext(longText, 500);
    expect(compressed.length).toBeLessThanOrEqual(530);
    expect(compressed).toContain('[Context truncated for token budget]');
  });
});
