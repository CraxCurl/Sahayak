# Architectural Blueprint & Module Boundaries

## Core Architecture Principles

1. **Feature Isolation**: Each module inside `src/ai`, `src/dom`, `src/extension`, and `src/forms` is owned by a single developer and has strict boundaries.
2. **Zero Cross-Module Direct Imports**:
   - `src/ai/` CANNOT import from `src/dom/` or `src/forms/`
   - `src/dom/` CANNOT import from `src/ai/`
   - All inter-module communication is mediated by `@shared/types`, `@shared/events`, or Background Service Worker IPC messaging.
3. **Structured AI Contract**: Google Gemma MUST return structured JSON validated by Zod schemas (`SahayakActionManifestZodSchema`).
4. **Runtime DOM Safety**: The DOM Engine executes actions ephemerally. Original HTML content snippets are backed up in a `WeakMap` prior to modification and restored cleanly upon reset.

---

## Chrome Manifest V3 Data Flow

```text
[ Target Page ] <--- Content Script ---> [ Background Service Worker ] <---> [ Gemma API ]
                            |                        ^
                            v                        |
                    [ Page Analyzer ]        [ Typed Message Router ]
```

1. **Content Script** initializes on tab load and triggers `PageAnalyzer.analyzeCurrentPage()`.
2. Page text summary is dispatched to **Background Service Worker** via `chrome.runtime.sendMessage`.
3. Background Worker invokes `GemmaClient.generatePageAdaptation()`.
4. Raw output text from Gemma is validated via Zod schema (`parseAndValidateGemmaOutput`).
5. Validated `SahayakActionManifest` is sent back to Content Script.
6. `SafeDOMExecutor` applies non-destructive CSS injections and DOM element highlighting.
