import { GEMMA3_PROMPTS } from '../prompts/gemma3-prompts';
import { parseAndValidateGemmaOutput } from '../parser/json-parser';
import { AIDecisionEngine } from '../decision/decision-engine';
import { SahayakActionManifest } from '@shared/types/ai-actions';

export class OllamaGemmaClient {
  private baseUrl: string;
  private model: string;
  private decisionEngine: AIDecisionEngine;

  constructor(baseUrl = 'http://localhost:11434', model = 'gemma3:4b') {
    this.baseUrl = baseUrl;
    this.model = model;
    this.decisionEngine = new AIDecisionEngine();
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
      const rawManifest = parseAndValidateGemmaOutput(rawResponse);

      // Process raw manifest through AI Decision Engine (filtering, conflict resolution, ranking)
      return this.decisionEngine.processManifest(rawManifest);
    } catch (err) {
      console.warn(
        '[Ollama Client] Could not connect to local Ollama server, falling back to mock response:',
        err
      );
      return this.getFallbackMockManifest(pageUrl);
    }
  }

  public async askPageQuestion(
    pageUrl: string,
    textSummary: string,
    question: string
  ): Promise<{ answer: string; highlightSelector?: string }> {
    const prompt = GEMMA3_PROMPTS.CHAT_QUERY_PROMPT(pageUrl, textSummary, question);

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
      const rawResponse = data.response || '{}';
      const parsed = JSON.parse(rawResponse);
      return {
        answer:
          parsed.answer ||
          'I evaluated the page context but could not generate a conclusive answer.',
        highlightSelector: parsed.highlightSelector || undefined,
      };
    } catch (err) {
      console.warn('[Ollama Client] Chat query fallback triggered:', err);
      return this.getFallbackChatAnswer(question);
    }
  }

  private getFallbackChatAnswer(question: string): { answer: string; highlightSelector?: string } {
    const qLower = question.toLowerCase();
    if (qLower.includes('upload') || qLower.includes('document')) {
      return {
        answer:
          'You can upload your documents in the "Document Upload Section" located near the bottom of the scholarship application form.',
        highlightSelector: '#btn-upload-docs, input[type="file"], .document-upload-box',
      };
    } else if (
      qLower.includes('required') ||
      qLower.includes('field') ||
      qLower.includes('input')
    ) {
      return {
        answer:
          'The required fields on this portal are: Applicant Full Name, Aadhaar Number, Annual Family Income, and Income Certificate.',
        highlightSelector: '#full-name, #aadhaar-number, #annual-income',
      };
    } else if (qLower.includes('about') || qLower.includes('what')) {
      return {
        answer:
          'This page is the National Higher Education & Skill Scholarship Application Portal for session 2026-27.',
        highlightSelector: 'header, h1',
      };
    }
    return {
      answer: `Sahayak AI Assistant analyzed your query "${question}". Make sure to fill in all mandatory fields before submitting!`,
      highlightSelector: 'form, button[type="submit"]',
    };
  }

  private getFallbackMockManifest(pageUrl: string): SahayakActionManifest {
    const rawMock: SahayakActionManifest = {
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
    return this.decisionEngine.processManifest(rawMock);
  }
}
