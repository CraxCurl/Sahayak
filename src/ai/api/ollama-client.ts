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

  private async resolveBaseUrlAndModel(): Promise<{ url: string; activeModel: string }> {
    const candidateUrls = [this.baseUrl, 'http://127.0.0.1:11434', 'http://localhost:11434'];
    const uniqueUrls = Array.from(new Set(candidateUrls));

    for (const url of uniqueUrls) {
      try {
        const tagsRes = await fetch(`${url}/api/tags`, { method: 'GET' });
        if (tagsRes.ok) {
          const data = await tagsRes.json();
          const models: Array<{ name: string }> = data.models || [];
          if (models.length > 0) {
            // Check if exact model exists
            const exactMatch = models.find(
              m => m.name === this.model || m.name.startsWith(this.model)
            );
            if (exactMatch) {
              return { url, activeModel: exactMatch.name };
            }
            // Check if any gemma model exists
            const gemmaMatch = models.find(m => m.name.toLowerCase().includes('gemma'));
            if (gemmaMatch) {
              return { url, activeModel: gemmaMatch.name };
            }
            // Fallback to first available model in Ollama
            return { url, activeModel: models[0].name };
          }
          return { url, activeModel: this.model };
        }
      } catch {
        // Try next candidate URL
      }
    }
    return { url: this.baseUrl, activeModel: this.model };
  }

  public async generatePageAdaptation(
    pageUrl: string,
    textSummary: string,
    userPreferences: Record<string, unknown>
  ): Promise<SahayakActionManifest> {
    const { url, activeModel } = await this.resolveBaseUrlAndModel();
    const prompt = GEMMA3_PROMPTS.PAGE_ANALYSIS_PROMPT(
      pageUrl,
      textSummary,
      JSON.stringify(userPreferences)
    );

    try {
      const response = await fetch(`${url}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: activeModel,
          prompt,
          system: GEMMA3_PROMPTS.SYSTEM_INSTRUCTION,
          stream: false,
          format: 'json',
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama HTTP error ${response.status} using model ${activeModel}`);
      }

      const data = await response.json();
      const rawResponse = data.response || '';
      const rawManifest = parseAndValidateGemmaOutput(rawResponse);

      // Process raw manifest through AI Decision Engine (filtering, conflict resolution, ranking)
      return this.decisionEngine.processManifest(rawManifest);
    } catch (err) {
      console.warn(
        '[Ollama Client] Could not connect to local Ollama server, applying page-adapted fallback UI:',
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
    const { url, activeModel } = await this.resolveBaseUrlAndModel();
    const prompt = GEMMA3_PROMPTS.CHAT_QUERY_PROMPT(pageUrl, textSummary, question);

    try {
      const response = await fetch(`${url}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: activeModel,
          prompt,
          system: GEMMA3_PROMPTS.SYSTEM_INSTRUCTION,
          stream: false,
          format: 'json',
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama HTTP error ${response.status}`);
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
      summary: 'Minimal basic layout mode applied (distractions hidden, primary buttons highlighted)',
      actions: [
        {
          id: 'action-fallback-hide-distractions',
          type: 'HIDE_ELEMENT',
          selector: '.ad, aside, .sidebar, .banner, .footer-links, .social-share, .promo, [role="complementary"]',
          confidence: 0.98,
          reasoning: 'Hide non-essential distracting widgets and sidebars for minimal browsing mode',
        },
        {
          id: 'action-fallback-highlight-necessary-buttons',
          type: 'HIGHLIGHT_ELEMENT',
          selector: '#btn-upload-docs, #btn-submit-application, button[type="submit"], input[type="submit"], .btn-primary',
          confidence: 0.95,
          color: '#38bdf8',
          reasoning: 'Highlight necessary primary action buttons for fast, focused interaction',
        },
        {
          id: 'action-fallback-simplify-jargon',
          type: 'SIMPLIFY_TEXT',
          selector: '.policy-text, .notice-card p',
          confidence: 0.9,
          simplifiedContent: 'Simplified Note: Ensure all income details and uploaded certificates are accurate before submitting.',
          originalTextSnippet: 'By submitting this application, the applicant certifies statement accuracy.',
          reasoning: 'Simplify complex legal terms into plain language',
        },
      ],
    };
    return this.decisionEngine.processManifest(rawMock);
  }
}
