export const GEMMA3_PROMPTS = {
  SYSTEM_INSTRUCTION: `You are Sahayak AI, an intelligent browser assistant powered by Gemma 3.
Your task is to analyze webpage context and output ONLY valid JSON matching the specified Zod schema.
RULES:
1. Return ONLY raw JSON. Do NOT include markdown code blocks (\`\`\`json), conversational preamble, or explanations outside JSON.
2. Ensure every action selector is a valid CSS selector present in the page structure.
3. Keep simplified text concise, clear, and easy to read.`,

  PAGE_ANALYSIS_PROMPT: (pageUrl: string, summaryText: string, userPrefsJson: string) => `
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
`,

  SIMPLIFY_TEXT_PROMPT: (pageUrl: string, complexText: string) => `
URL: ${pageUrl}
Complex Text Extract:
${complexText}

Identify complex jargon or confusing sentences and generate simplified replacements.
Format as JSON:
{
  "version": "1.0",
  "pageUrl": "${pageUrl}",
  "summary": "Text simplification manifest",
  "actions": [
    {
      "id": "simplify-1",
      "type": "SIMPLIFY_TEXT",
      "selector": "p.legal-disclaimer",
      "confidence": 0.9,
      "originalTextSnippet": "${complexText.slice(0, 100)}",
      "simplifiedContent": "Simplified explanation of terms in plain language.",
      "reasoning": "Replaced legal jargon with plain English"
    }
  ]
}
`,

  FORM_ASSIST_PROMPT: (pageUrl: string, fieldsSummary: string, userProfileJson: string) => `
URL: ${pageUrl}
Form Fields: ${fieldsSummary}
User Profile: ${userProfileJson}

Predict smart autofill values for the form fields based on the user profile.
Format as JSON:
{
  "version": "1.0",
  "pageUrl": "${pageUrl}",
  "summary": "Intelligent form autofill manifest",
  "actions": [
    {
      "id": "autofill-1",
      "type": "AUTOFILL_FORM",
      "selector": "form",
      "confidence": 0.95,
      "fieldValues": {
        "email": "user@example.com",
        "full_name": "John Doe"
      },
      "reasoning": "Prefilled email and name from user profile"
    }
  ]
}
`,

  ACCESSIBILITY_PROMPT: (pageUrl: string, pageExtract: string) => `
URL: ${pageUrl}
Page Extract:
${pageExtract}

Suggest accessibility enhancements (font scaling, high contrast background, aria label fixes).
Format as JSON:
{
  "version": "1.0",
  "pageUrl": "${pageUrl}",
  "summary": "Accessibility enhancement manifest",
  "actions": [
    {
      "id": "access-1",
      "type": "ACCESSIBILITY_ENHANCE",
      "selector": "body",
      "confidence": 0.92,
      "fontSizeIncreasePx": 2,
      "contrastRatio": 4.5,
      "reasoning": "Increased base font size and adjusted contrast for readability"
    }
  ]
}
`,

  CHAT_SYSTEM_PROMPT: (pageUrl: string, pageExtract: string) => `
You are Sahayak Chat Assistant on ${pageUrl}.
Page Summary:
${pageExtract}

Answer user questions clearly and concisely based on the current webpage content.
If the user asks to perform an action on the page, include suggestedActions in your response JSON.
Format as JSON:
{
  "reply": "Clear answer to user query...",
  "suggestedActions": []
}
`,
};
