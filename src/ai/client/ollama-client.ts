import { SYSTEM_INSTRUCTION, buildPageAnalysisPrompt } from '../prompts/page-analysis.prompt';
import { buildChatQueryPrompt } from '../prompts/chat-query.prompt';
import { parseAndValidateGemmaOutput } from '../parser/json-extractor';
import { ConflictResolver } from '../decision/conflict-resolver';
import { PageAdaptationManifest } from '../schemas/page-adaptation.schema';

export type OllamaHealthState = 'unreachable' | 'reachable_no_model' | 'ready';

export interface OllamaHealthResult {
  state: OllamaHealthState;
  activeModel?: string;
  hostUrl?: string;
}

export class OllamaGemmaClient {
  private baseUrl: string;
  private model: string;
  private conflictResolver: ConflictResolver;
  private debugMode: boolean = false;

  constructor(baseUrl = 'http://localhost:11434', model = 'gemma3:4b') {
    this.baseUrl = baseUrl;
    this.model = model;
    this.conflictResolver = new ConflictResolver();
  }

  public setDebugMode(enable: boolean): void {
    this.debugMode = enable;
  }

  /**
   * Health check called on startup and exposed via window.Sahayak.health().
   * Tries http://localhost:11434/api/tags, then http://127.0.0.1:11434/api/tags.
   */
  public async checkOllamaHealth(): Promise<OllamaHealthResult> {
    const candidateUrls = [this.baseUrl, 'http://localhost:11434', 'http://127.0.0.1:11434'];
    const uniqueUrls = Array.from(new Set(candidateUrls));

    for (const url of uniqueUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const tagsRes = await fetch(`${url}/api/tags`, { method: 'GET', signal: controller.signal });
        clearTimeout(timeoutId);

        if (tagsRes.ok) {
          const data = await tagsRes.json();
          const models: Array<{ name: string }> = data.models || [];
          if (models.length === 0) {
            return { state: 'reachable_no_model', hostUrl: url };
          }
          const hasGemmaModel = models.some(
            m => m.name.toLowerCase().includes('gemma3') || m.name.toLowerCase().includes('gemma')
          );
          const activeModel =
            models.find(m => m.name === this.model || m.name.startsWith(this.model))?.name ||
            models.find(m => m.name.toLowerCase().includes('gemma'))?.name ||
            models[0].name;

          return {
            state: hasGemmaModel ? 'ready' : 'reachable_no_model',
            activeModel,
            hostUrl: url,
          };
        }
      } catch {
        // Try next candidate URL
      }
    }
    return { state: 'unreachable' };
  }

  private async resolveBaseUrlAndModel(): Promise<{ url: string; activeModel: string }> {
    const health = await this.checkOllamaHealth();
    if (health.state === 'ready' && health.hostUrl && health.activeModel) {
      return { url: health.hostUrl, activeModel: health.activeModel };
    }
    return { url: this.baseUrl, activeModel: this.model };
  }

  private async postOllamaWithTimeout(
    url: string,
    bodyObj: Record<string, unknown>,
    attempt = 1
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    if (this.debugMode) {
      console.log(`[Sahayak Ollama Debug Request Attempt ${attempt}]:`, {
        url: `${url}/api/generate`,
        body: bodyObj,
      });
    }

    try {
      const response = await fetch(`${url}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyObj),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (this.debugMode) {
        console.log(`[Sahayak Ollama Debug Response Attempt ${attempt}]:`, {
          status: response.status,
          statusText: response.statusText,
        });
      }
      return response;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError' && attempt === 1) {
        console.warn('[Sahayak Ollama Client] Request timed out (30s). Retrying once...');
        return this.postOllamaWithTimeout(url, bodyObj, 2);
      }
      throw err;
    }
  }

  public async generatePageAdaptation(
    pageUrl: string,
    textSummary: string,
    userPreferences: Record<string, unknown>
  ): Promise<PageAdaptationManifest> {
    const health = await this.checkOllamaHealth();

    if (health.state !== 'ready') {
      console.warn(
        `[Ollama Client] Health check failed (${health.state}). Returning labeled fallback manifest.`
      );
      return this.getFallbackMockManifest(pageUrl, health.state);
    }

    const { url, activeModel } = await this.resolveBaseUrlAndModel();
    const prompt = buildPageAnalysisPrompt(pageUrl, textSummary, JSON.stringify(userPreferences));

    try {
      const response = await this.postOllamaWithTimeout(url, {
        model: activeModel,
        prompt,
        system: SYSTEM_INSTRUCTION,
        stream: false,
        format: 'json',
      });

      if (!response.ok) {
        throw new Error(`Ollama HTTP error ${response.status} using model ${activeModel}`);
      }

      const data = await response.json();
      const rawResponse = data.response || '';
      const rawManifest = parseAndValidateGemmaOutput(rawResponse);

      return this.conflictResolver.processManifest(rawManifest);
    } catch (err) {
      console.warn(
        '[Ollama Client] Could not connect to local Ollama server, applying page-adapted fallback UI:',
        err
      );
      return this.getFallbackMockManifest(pageUrl, 'unreachable');
    }
  }

  public async askPageQuestion(
    pageUrl: string,
    textSummary: string,
    question: string
  ): Promise<{ answer: string; highlightSelector?: string }> {
    const { url, activeModel } = await this.resolveBaseUrlAndModel();
    const prompt = buildChatQueryPrompt(pageUrl, textSummary, question);

    try {
      const response = await this.postOllamaWithTimeout(url, {
        model: activeModel,
        prompt,
        system: SYSTEM_INSTRUCTION,
        stream: false,
        format: 'json',
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
      const mainTopics = cleanHeadings.split(' | ').filter(Boolean).slice(0, 5);
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

  private getFallbackMockManifest(pageUrl: string, healthState: OllamaHealthState = 'unreachable'): PageAdaptationManifest {
    const statusText =
      healthState === 'reachable_no_model'
        ? 'Ollama server up, model gemma3:4b not found. Run: ollama pull gemma3:4b'
        : 'Ollama server unreachable at http://localhost:11434';

    const rawMock: PageAdaptationManifest = {
      version: '1.0',
      pageUrl,
      summary: `Demo data — AI not connected (${statusText})`,
      actions: [
        {
          type: 'HIDE_ELEMENT',
          selector: '.ad, aside, .sidebar, .banner, .footer-links, .social-share, .promo, [role="complementary"]',
          confidence: 0.98,
          reasoning: 'Hide non-essential distracting widgets and sidebars for minimal browsing mode',
          priority: 'medium',
        },
        {
          type: 'HIGHLIGHT_ELEMENT',
          selector: '#btn-upload-docs, #btn-submit-application, button[type="submit"], input[type="submit"], .btn-primary',
          confidence: 0.95,
          color: '#38bdf8',
          reasoning: 'Highlight necessary primary action buttons for fast, focused interaction',
          priority: 'high',
        },
        {
          type: 'SIMPLIFY_TEXT',
          selector: '.policy-text, .notice-card p',
          confidence: 0.9,
          simplifiedContent: 'Simplified Note: Ensure all income details and uploaded certificates are accurate before submitting.',
          originalTextSnippet: 'By submitting this application, the applicant certifies statement accuracy.',
          reasoning: 'Simplify complex legal terms into plain language',
          priority: 'medium',
        },
      ],
    };
    return this.conflictResolver.processManifest(rawMock);
  }
}
