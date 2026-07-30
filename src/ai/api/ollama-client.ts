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
      const rawResponse = (data.response || '').trim();

      let answer = '';
      let highlightSelector: string | undefined = undefined;

      try {
        const cleanedJson = rawResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanedJson);
        answer = parsed.answer || parsed.reply || parsed.summary || rawResponse;
        highlightSelector = parsed.highlightSelector || undefined;
      } catch {
        // If Gemma 3 returned text instead of valid JSON, use the response text directly as answer!
        answer = rawResponse || `I evaluated your query on ${pageUrl}.`;
      }

      return { answer, highlightSelector };
    } catch (err) {
      console.warn('[Ollama Client] Chat query fallback triggered:', err);
      return this.getFallbackChatAnswer(pageUrl, textSummary, question);
    }
  }

  private getFallbackChatAnswer(
    pageUrl: string,
    textSummary: string,
    question: string
  ): { answer: string; highlightSelector?: string } {
    const qLower = question.toLowerCase();

    let domain = 'this website';
    try {
      const parsedUrl = new URL(pageUrl);
      domain = parsedUrl.hostname.replace('www.', '');
    } catch {
      domain = pageUrl || 'this website';
    }

    const lines = (textSummary || '').split('\n');
    const titleLine =
      lines.find(l => l.toLowerCase().startsWith('page title:') || l.toLowerCase().startsWith('title:')) ||
      '';
    const cleanTitle = titleLine.replace(/^(page title:|title:)/i, '').trim() || domain;

    const headingsLine = lines.find(l => l.toLowerCase().includes('headings:')) || '';
    const cleanHeadings = headingsLine.replace(/^(all headings:|headings:)/i, '').trim();

    const buttonsLine = lines.find(l => l.toLowerCase().includes('buttons:')) || '';
    const cleanButtons = buttonsLine.replace(/^(all interactive buttons:|buttons:)/i, '').trim();

    const inputsLine = lines.find(l => l.toLowerCase().includes('inputs & fields:')) || '';
    const cleanInputs = inputsLine.replace(/^(all form inputs & fields:|inputs:)/i, '').trim();

    const textExtractIndex = lines.findIndex(l => l.toLowerCase().includes('text content:'));
    const bodyText = textExtractIndex !== -1 ? lines.slice(textExtractIndex + 1).join(' ').trim() : textSummary;

    let answer = `📌 Webpage Analysis: "${cleanTitle}" (${domain})\n\n`;

    if (cleanHeadings) {
      const mainTopics = cleanHeadings
        .split(' | ')
        .filter(Boolean)
        .slice(0, 5);
      answer += `📂 Key Sections & Topics:\n• ${mainTopics.join('\n• ')}\n\n`;
    }

    if (cleanButtons || cleanInputs) {
      answer += `⚙️ Interactive Page Controls:\n`;
      if (cleanButtons) answer += `• Buttons: ${cleanButtons.slice(0, 140)}\n`;
      if (cleanInputs) answer += `• Input Fields: ${cleanInputs.slice(0, 140)}\n`;
      answer += `\n`;
    }

    if (bodyText) {
      answer += `📖 Content Summary:\n${bodyText.slice(0, 320)}...\n\n`;
    }

    let highlightSelector: string | undefined = 'h1, header, main';

    if (qLower.includes('upload') || qLower.includes('document') || qLower.includes('file')) {
      answer += `📍 Specific Guidance: Look for file attachment or document upload sections highlighted on the page.`;
      highlightSelector = '#btn-upload-docs, input[type="file"], .document-upload-box, button';
    } else if (
      qLower.includes('required') ||
      qLower.includes('field') ||
      qLower.includes('input') ||
      qLower.includes('form')
    ) {
      answer += `📍 Specific Guidance: Scanned mandatory input fields on this page. Highlighted form controls are ready for input.`;
      highlightSelector = 'input[required], select[required], textarea[required], input';
    } else {
      answer += `📍 Analysis completed for your question: "${question}".`;
      highlightSelector = 'h1, h2, form, button';
    }

    return { answer, highlightSelector };
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
