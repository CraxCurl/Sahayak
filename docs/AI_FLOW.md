# AI Flow — Local Gemma 3 via Ollama

> This document describes the complete AI inference pipeline in Sahayak.

---

## Overview

Sahayak uses **Google Gemma 3 (4B)** running **100% locally** via **Ollama** at `http://localhost:11434`. Zero cloud API keys are used. Zero external network requests are made for AI inference.

---

## AI Pipeline

```
Webpage Loaded
      ↓
PageAnalyzer.extractPageData()           → Compressed context (title, headings, buttons, inputs, ARIA)
      ↓
GEMMA3_PROMPTS.PAGE_ANALYSIS_PROMPT()    → Structured prompt with user preferences
      ↓
OllamaGemmaClient.generatePageAdaptation()  → POST http://localhost:11434/api/generate
      ↓
Raw JSON Response from Gemma 3
      ↓
parseAndValidateGemmaOutput()            → Zod schema validation (SahayakActionManifestZodSchema)
      ↓
AIDecisionEngine.processManifest()       → Confidence filtering (≥0.5), deduplication, conflict resolution
      ↓
SahayakActionManifest                    → Structured action JSON sent to content script
      ↓
SafeDOMExecutor.executeManifest()        → Non-destructive DOM transformations
```

---

## Key Components

### 1. Context Builder (`src/dom/analyzer/page-analyzer.ts`)
- Extracts compressed page context: title, headings, buttons, inputs (with selectors), forms, visible text, ARIA role count.
- Never sends entire HTML. Maximum 4000 characters of visible text.

### 2. Prompt Builder (`src/ai/prompts/gemma3-prompts.ts`)
- `SYSTEM_INSTRUCTION`: Defines Sahayak AI as a UX assistant, enforces JSON-only output.
- `PAGE_ANALYSIS_PROMPT()`: Injects page context + user preferences, requests `SahayakActionManifest` JSON.
- `CHAT_QUERY_PROMPT()`: Context-aware Q&A prompt for the chat assistant.

### 3. Ollama Client (`src/ai/api/ollama-client.ts`)
- `generatePageAdaptation()`: Sends prompt to Ollama, parses response, runs through Decision Engine.
- `askPageQuestion()`: Handles chat assistant queries with element highlight selectors.
- Graceful fallback to mock responses if Ollama is offline.

### 4. JSON Parser (`src/ai/parser/json-parser.ts`)
- Strips markdown fenced code blocks from raw Gemma output.
- Parses JSON and validates against `SahayakActionManifestZodSchema`.
- Throws descriptive errors on validation failure.

### 5. Decision Engine (`src/ai/decision/decision-engine.ts`)
- Filters actions below confidence threshold (default ≥ 0.5).
- Deduplicates actions targeting the same selector.
- Resolves conflicts (e.g., HIGHLIGHT vs HIDE on the same element).
- Sorts actions by confidence descending.

### 6. Zod Schemas (`src/ai/schemas/action-schema.ts`)
- `SahayakActionManifestZodSchema`: Top-level manifest schema.
- Discriminated union of 6 action types: `HIGHLIGHT_ELEMENT`, `HIDE_ELEMENT`, `SIMPLIFY_TEXT`, `INJECT_CSS`, `AUTOFILL_FORM`, `ACCESSIBILITY_ENHANCE`.

---

## JSON Contract

Every AI response must conform to:

```json
{
  "version": "1.0",
  "pageUrl": "https://example.com",
  "summary": "Brief explanation of adaptations",
  "actions": [
    {
      "id": "act-1",
      "type": "HIGHLIGHT_ELEMENT",
      "selector": "#submit-btn",
      "confidence": 0.95,
      "color": "#38bdf8",
      "reasoning": "Primary CTA button highlighted for accessibility"
    }
  ]
}
```
