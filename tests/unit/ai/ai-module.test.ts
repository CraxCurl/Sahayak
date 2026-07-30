import { describe, it, expect } from 'vitest';
import { cleanRawJsonString, parseAndValidateGemmaOutput } from '@ai/parser/json-parser';
import { AIDecisionEngine } from '@ai/decision/decision-engine';
import { GEMMA3_PROMPTS } from '@ai/prompts/gemma3-prompts';
import { SahayakActionManifest } from '@shared/types/ai-actions';

describe('Developer 3: AI Module Tests', () => {
  describe('JSON Parser & Cleaner', () => {
    it('should strip markdown fenced code blocks from Gemma output', () => {
      const rawWithFences = `\`\`\`json\n{\n  "version": "1.0",\n  "pageUrl": "https://example.com",\n  "summary": "Test",\n  "actions": []\n}\n\`\`\``;
      const cleaned = cleanRawJsonString(rawWithFences);
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
            id: 'act-1',
            type: 'HIGHLIGHT_ELEMENT',
            selector: 'h1',
            confidence: 0.9,
            color: '#38bdf8',
          },
        ],
      });

      const manifest = parseAndValidateGemmaOutput(validJson);
      expect(manifest.version).toBe('1.0');
      expect(manifest.actions.length).toBe(1);
      expect(manifest.actions[0].type).toBe('HIGHLIGHT_ELEMENT');
    });
  });

  describe('AI Decision Engine', () => {
    it('should filter out actions below the confidence threshold', () => {
      const decisionEngine = new AIDecisionEngine({ minConfidenceThreshold: 0.8 });
      const rawManifest: SahayakActionManifest = {
        version: '1.0',
        pageUrl: 'https://example.com',
        summary: 'Testing filtering',
        actions: [
          {
            id: 'act-high',
            type: 'HIGHLIGHT_ELEMENT',
            selector: '.btn',
            confidence: 0.95,
            color: '#38bdf8',
          },
          {
            id: 'act-low',
            type: 'HIGHLIGHT_ELEMENT',
            selector: '.footer',
            confidence: 0.4,
            color: '#38bdf8',
          },
        ],
      };

      const refined = decisionEngine.processManifest(rawManifest);
      expect(refined.actions.length).toBe(1);
      expect(refined.actions[0].id).toBe('act-high');
    });

    it('should resolve conflicts when element has both HIDE and HIGHLIGHT actions', () => {
      const decisionEngine = new AIDecisionEngine();
      const rawManifest: SahayakActionManifest = {
        version: '1.0',
        pageUrl: 'https://example.com',
        summary: 'Testing conflict resolution',
        actions: [
          {
            id: 'act-hide',
            type: 'HIDE_ELEMENT',
            selector: '#ad-banner',
            confidence: 0.9,
          },
          {
            id: 'act-highlight',
            type: 'HIGHLIGHT_ELEMENT',
            selector: '#ad-banner',
            confidence: 0.85,
            color: '#38bdf8',
          },
        ],
      };

      const refined = decisionEngine.processManifest(rawManifest);
      expect(refined.actions.length).toBe(1);
      expect(refined.actions[0].type).toBe('HIDE_ELEMENT');
    });
  });

  describe('Gemma 3 Prompts', () => {
    it('should format page analysis prompt correctly', () => {
      const prompt = GEMMA3_PROMPTS.PAGE_ANALYSIS_PROMPT('https://test.com', 'Page Summary', '{}');
      expect(prompt).toContain('URL: https://test.com');
      expect(prompt).toContain('Webpage Context Extract:');
    });
  });
});
