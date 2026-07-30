import { OllamaGemmaClient } from './ollama-client';
import { SahayakActionManifest } from '@shared/types/ai-actions';

/**
 * Local-First Gemma Client.
 * All AI inferences are strictly executed via Ollama running locally at http://localhost:11434.
 * Cloud APIs, API keys, and external network requests are strictly disabled.
 */
export class GemmaClient {
  private ollamaClient: OllamaGemmaClient;

  constructor(baseUrl = 'http://localhost:11434', model = 'gemma3:4b') {
    this.ollamaClient = new OllamaGemmaClient(baseUrl, model);
  }

  public async generatePageAdaptation(
    pageUrl: string,
    textSummary: string,
    userPreferences: Record<string, unknown>
  ): Promise<SahayakActionManifest> {
    return this.ollamaClient.generatePageAdaptation(pageUrl, textSummary, userPreferences);
  }

  public async askPageQuestion(
    pageUrl: string,
    textSummary: string,
    question: string
  ): Promise<{ answer: string; highlightSelector?: string }> {
    return this.ollamaClient.askPageQuestion(pageUrl, textSummary, question);
  }
}
