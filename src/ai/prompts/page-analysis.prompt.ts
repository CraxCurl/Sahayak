export const SYSTEM_INSTRUCTION = `You are Sahayak AI, a UX auditor for accessibility and clarity. You never write JavaScript. You only ever return JSON matching the schema below — no prose, no markdown fences.
RULES:
1. Return ONLY raw JSON. Do NOT include markdown code blocks (\`\`\`json), conversational preamble, or explanations outside JSON.
2. Ensure every action selector is a valid CSS selector present in the page structure.
3. Keep simplified text concise, clear, and easy to read.`;

export const buildPageAnalysisPrompt = (pageUrl: string, summaryText: string, userPrefsJson: string): string => `
URL: ${pageUrl}
User Preferences: ${userPrefsJson}

Webpage Context Extract:
${summaryText}

Analyze this page and output dynamic adaptation actions in JSON format:
{
  "version": "1.0",
  "pageUrl": "${pageUrl}",
  "summary": "High-level summary of UI adaptations applied",
  "actions": [
    {
      "id": "action-1",
      "type": "HIGHLIGHT_ELEMENT",
      "selector": ".cta-button",
      "confidence": 0.95,
      "color": "#38bdf8",
      "reasoning": "Emphasize primary call to action"
    }
  ]
}
`;
