import { GEMMA3_PROMPTS } from '../prompts/gemma3-prompts';
import { parseAndValidateGemmaOutput } from '../parser/json-parser';
import { SahayakActionManifest } from '@shared/types/ai-actions';

export class OllamaGemmaClient {
  private baseUrl: string;
  private model: string;

  constructor(baseUrl = 'http://localhost:11434', model = 'gemma3:4b') {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  public async generatePageAdaptation(
    pageUrl: string,
    textSummary: string,
    userPreferences: Record<string, unknown>
  ): Promise<SahayakActionManifest> {
    const prompt = GEMMA3_PROMPTS.PAGE_ANALYSIS_PROMPT(
      pageUrl,
      textSummary,
      JSON.stringify(userPreferences)
    );

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          system: GEMMA3_PROMPTS.SYSTEM_INSTRUCTION,
          stream: false,
          format: 'json',
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const rawResponse = data.response || '';
      return parseAndValidateGemmaOutput(rawResponse);
    } catch (err) {
      console.warn(
        '[Ollama Client] Could not connect to local Ollama server, falling back to mock response:',
        err
      );
      return this.getFallbackMockManifest(pageUrl);
    }
  }

  private getFallbackMockManifest(pageUrl: string): SahayakActionManifest {
    return {
      version: '1.0',
      pageUrl,
      summary: 'Fallback response generated locally (Ollama offline)',
      actions: [
        {
          id: 'action-fallback-1',
          type: 'HIGHLIGHT_ELEMENT',
          selector: 'main, article, h1',
          confidence: 0.95,
          color: '#38bdf8',
          reasoning: 'Highlighted main content area for enhanced reading focus',
        },
      ],
    };
  }
}
