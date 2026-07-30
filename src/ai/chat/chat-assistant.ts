import { GEMMA3_PROMPTS } from '../prompts/gemma3-prompts';
import { cleanRawJsonString } from '../parser/json-parser';
import { ChatResponseSchema, ChatMessageSchemaType } from '../schemas/action-schema';

export class ChatAssistant {
  private baseUrl: string;
  private model: string;
  private history: ChatMessageSchemaType[] = [];

  constructor(baseUrl = 'http://localhost:11434', model = 'gemma3:4b') {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  public async sendMessage(
    userMessageText: string,
    pageUrl: string,
    pageExtract: string
  ): Promise<string> {
    const userMsg: ChatMessageSchemaType = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userMessageText,
      timestamp: Date.now(),
    };
    this.history.push(userMsg);

    const systemPrompt = GEMMA3_PROMPTS.CHAT_SYSTEM_PROMPT(pageUrl, pageExtract);

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt: `User Query: ${userMessageText}\nConversation History: ${JSON.stringify(
            this.history.slice(-6)
          )}`,
          system: systemPrompt,
          stream: false,
          format: 'json',
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama Chat request failed with status: ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.response || '';
      const cleanedJson = cleanRawJsonString(rawText);

      try {
        const parsed = ChatResponseSchema.parse(JSON.parse(cleanedJson));
        const assistantMsg: ChatMessageSchemaType = {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: parsed.reply,
          timestamp: Date.now(),
        };
        this.history.push(assistantMsg);
        return parsed.reply;
      } catch {
        // Fallback if model responded in plain text
        const assistantMsg: ChatMessageSchemaType = {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: rawText,
          timestamp: Date.now(),
        };
        this.history.push(assistantMsg);
        return rawText;
      }
    } catch (err) {
      console.error('[Chat Assistant] Error generating response:', err);
      return "I'm having trouble connecting to local Gemma 3. Please check if Ollama is running.";
    }
  }

  public getHistory(): ChatMessageSchemaType[] {
    return [...this.history];
  }

  public clearHistory(): void {
    this.history = [];
  }
}
