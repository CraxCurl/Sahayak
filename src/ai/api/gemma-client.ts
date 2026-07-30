import { GEMMA_PROMPTS } from '../prompts/gemma-templates';
import { parseAndValidateGemmaOutput } from '../parser/json-parser';
import { SahayakActionManifest } from '@shared/types/ai-actions';

export class GemmaClient {
  private apiKey: string;
  private endpoint: string;

  constructor(apiKey: string, endpoint?: string) {
    this.apiKey = apiKey;
    this.endpoint =
      endpoint ||
      'https://generativelanguage.googleapis.com/v1beta/models/gemma-7b-it:generateContent';
  }

  public async generatePageAdaptation(
    pageUrl: string,
    textSummary: string,
    userPreferences: Record<string, unknown>
  ): Promise<SahayakActionManifest> {
    if (!this.apiKey) {
      return this.getMockManifest(pageUrl);
    }

    const prompt = GEMMA_PROMPTS.PAGE_ANALYSIS_PROMPT(
      pageUrl,
      textSummary,
      JSON.stringify(userPreferences)
    );

    const response = await fetch(`${this.endpoint}?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: GEMMA_PROMPTS.SYSTEM_INSTRUCTION }] },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemma API request failed with status: ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return parseAndValidateGemmaOutput(rawText);
  }

  private getMockManifest(pageUrl: string): SahayakActionManifest {
    return {
      version: '1.0',
      pageUrl,
      summary: 'Mock Gemma response generated for testing',
      actions: [
        {
          id: 'mock-action-1',
          type: 'HIGHLIGHT_ELEMENT',
          selector: 'h1, h2',
          confidence: 0.9,
          color: '#bae6fd',
          reasoning: 'Highlighted key headings for improved scanning readability',
        },
      ],
    };
  }
}
