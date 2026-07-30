export const buildChatQueryPrompt = (pageUrl: string, summaryText: string, userQuestion: string): string => `
Webpage URL: ${pageUrl}
Webpage Context Extract:
${summaryText}

User Question: "${userQuestion}"

Instructions:
You are Sahayak AI Assistant. Provide a detailed, comprehensive, and clear analysis in response to the user's question based on the webpage context provided above.
In your answer:
1. Explain what the website/page is about (main title, domain, primary purpose, and core topic).
2. List the key sections, headings, or main articles present on the page.
3. Highlight key interactive elements (buttons, forms, input fields, or file upload options available).
4. Directly answer "${userQuestion}" with actionable insights and clear steps.

If the user is asking where a specific element is located, identify a matching CSS selector (e.g. "h1", "input[type='file']", "#btn-upload-docs", "button", "form", ".content").

Return output strictly as a JSON object:
{
  "answer": "Detailed, multi-paragraph analysis formatted clearly with sections and bullet points.",
  "highlightSelector": "CSS selector to highlight, or null if no specific element needs highlighting"
}
`;
