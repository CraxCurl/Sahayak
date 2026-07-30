import { describe, it, expect } from 'vitest';
import { extractAndRepairJson, parseAndValidateGemmaOutput } from '@ai/parser/json-extractor';
import { ConflictResolver } from '@ai/decision/conflict-resolver';
import { buildPageAnalysisPrompt } from '@ai/prompts/page-analysis.prompt';
import { PageAdaptationManifest } from '@ai/schemas/page-adaptation.schema';

describe('Developer 3: AI Module Tests', () => {
  describe('JSON Parser & Cleaner', () => {
    it('should strip markdown fenced code blocks from Gemma output', () => {
      const rawWithFences = `\`\`\`json\n{\n  "version": "1.0",\n  "pageUrl": "https://example.com",\n  "summary": "Test",\n  "actions": []\n}\n\`\`\``;
      const cleaned = extractAndRepairJson(rawWithFences);
      expect(cleaned).not.toContain('```');
      expect(cleaned).toContain('"version": "1.0"');
    });

    it('should parse and validate a valid action manifest via Zod', () => {
      const validJson = JSON.stringify({
        version: '1.0',
        pageUrl: 'https://example.com',
        summary: 'Adaptation summary',
        actions: [
          {
            type: 'HIGHLIGHT_ELEMENT',
            selector: 'h1',
            confidence: 0.9,
            color: '#38bdf8',
            reasoning: 'Highlight title',
          },
        ],
      });

      const manifest = parseAndValidateGemmaOutput(validJson);
      expect(manifest.version).toBe('1.0');
      expect(manifest.actions.length).toBe(1);
      expect(manifest.actions[0].type).toBe('HIGHLIGHT_ELEMENT');
    });
  });

  describe('AI Conflict Resolver', () => {
    it('should filter out actions below the confidence threshold', () => {
      const resolver = new ConflictResolver(0.8);
      const rawManifest: PageAdaptationManifest = {
        version: '1.0',
        pageUrl: 'https://example.com',
        summary: 'Testing filtering',
        actions: [
          {
            type: 'HIGHLIGHT_ELEMENT',
            selector: '.btn',
            confidence: 0.95,
            color: '#38bdf8',
            reasoning: 'High confidence action',
          },
          {
            type: 'HIGHLIGHT_ELEMENT',
            selector: '.footer',
            confidence: 0.4,
            color: '#38bdf8',
            reasoning: 'Low confidence action',
          },
        ],
      };

      const refined = resolver.processManifest(rawManifest);
      expect(refined.actions.length).toBe(1);
      expect(refined.actions[0].selector).toBe('.btn');
    });

    it('should deduplicate actions targeting the exact same selector & type', () => {
      const resolver = new ConflictResolver(0.5);
      const rawManifest: PageAdaptationManifest = {
        version: '1.0',
        pageUrl: 'https://example.com',
        summary: 'Testing deduplication',
        actions: [
          {
            type: 'HIGHLIGHT_ELEMENT',
            selector: '#ad-banner',
            confidence: 0.9,
            reasoning: 'Highlight banner',
          },
          {
            type: 'HIGHLIGHT_ELEMENT',
            selector: '#ad-banner',
            confidence: 0.7,
            reasoning: 'Duplicate action',
          },
        ],
      };

      const refined = resolver.processManifest(rawManifest);
      expect(refined.actions.length).toBe(1);
      expect(refined.actions[0].confidence).toBe(0.9);
    });
  });

  describe('Gemma 3 Prompts', () => {
    it('should format page analysis prompt correctly', () => {
      const prompt = buildPageAnalysisPrompt('https://test.com', 'Page Summary', '{}');
      expect(prompt).toContain('URL: https://test.com');
      expect(prompt).toContain('Webpage Context Extract:');
    });
  });
});
