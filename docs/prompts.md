# Sahayak Prompt Versioning & Design Decisions 📝

This document records active Gemma 3 prompt templates and rejected prompt variations.

---

## 1. Page Analysis Prompt Template (`page-analysis.prompt.ts`)

**Version**: `v1.2.0`  
**Target Model**: `gemma3:4b` (Ollama)

### System Instruction:
```text
You are a UX auditor for accessibility and clarity. You never write JavaScript. You only ever return JSON matching the schema below — no prose, no markdown fences.
```

### Key Design Choices:
- **TypeScript Pseudocode Schema**: Included directly inside system prompt. Tested against prose descriptions — Gemma 3 adheres 40% more reliably to pseudocode format.
- **One-Sentence Reasoning Requirement**: Forces model to explain why an action is needed, eliminating hallucinated or generic selector modifications.
- **2 Few-Shot Examples**: Included 1 cluttered form portal example and 1 dense article page example.

---

## 2. Chat Query Prompt Template (`chat-query.prompt.ts`)

**Version**: `v1.2.0`  
**Target Model**: `gemma3:4b` (Ollama)

### Key Instructions:
1. Explain page topic and title.
2. Breakdown main sections & headings.
3. Highlight key interactive buttons & form fields.
4. Provide direct answer to user question with optional `highlightSelector`.

---

## 3. Rejected Prompt Variations ❌

1. **Attempted**: Requesting raw CSS rules inside prose response.  
   **Result**: Model generated invalid CSS selectors causing style bleeding. Replaced with structured Zod schema + CSS Sanitizer boundary.
2. **Attempted**: Passing full raw HTML source to model.  
   **Result**: Context length exceeded Ollama token buffer causing 10s+ generation delays. Replaced with `compressContext()` budget (2,000 chars max).
