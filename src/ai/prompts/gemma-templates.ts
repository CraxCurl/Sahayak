export const GEMMA_PROMPTS = {
  SYSTEM_INSTRUCTION: `You are Sahayak AI, an intelligent browser assistant.
Your task is to analyze webpage content and return ONLY a valid JSON object adhering to the specified schema.
DO NOT include markdown code blocks, conversational intro text, or extra characters.
Return ONLY valid JSON matching SahayakActionManifest Schema.`,

  PAGE_ANALYSIS_PROMPT: (pageUrl: string, summaryText: string, userPrefsJson: string) => `
Target Page URL: ${pageUrl}
User Preferences: ${userPrefsJson}

Page Extract:
${summaryText}

Analyze this page and determine UI adaptations, text simplifications, accessibility enhancements, or elements to highlight/hide.
Output JSON structure:
{
  "version": "1.0",
  "pageUrl": "${pageUrl}",
  "summary": "<Short explanation of adaptations>",
  "actions": [
    {
      "id": "action-1",
      "type": "HIGHLIGHT_ELEMENT",
      "selector": ".cta-button",
      "confidence": 0.95,
      "color": "#fef08a",
      "reasoning": "Primary action button highlighted for accessibility"
    }
  ]
}
`,
};
