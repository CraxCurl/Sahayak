# Sahayak — Permanent Project Memory 🧠

> **Core Principle**: The website adapts to the user — NOT the user adapts to the website.

---

## 🏗 Post-Rebuild System Architecture

Sahayak is built on Chrome Extension Manifest V3, communicating with a locally running **Google Gemma 3 (4B)** model via **Ollama** (`http://localhost:11434`). Zero cloud API keys or telemetry.

```text
 Target Webpage
       │
       ▼
 1. Content Script (PageAnalyzer + SPA MutationObserver)
       │ (extracts title, origin URL, headings, landmarks, interactive buttons, metrics)
       ▼
 2. Context Compressor (enforces strict 2,000 char budget)
       │
       ▼
 3. Long-Lived Port / Service Worker Message Router (sahayak-chat-port)
       │
       ▼
 4. Ollama Gemma Client (checkOllamaHealth + 30s timeout retry policy)
       │
       ▼
 5. JSON Extractor & Zod Parser (PageAdaptationManifestSchema validation)
       │
       ▼
 6. Conflict Resolver (deduplication & confidence thresholding)
       │
       ▼
 7. Safe DOM Executor (CSSInjector + CSSSanitizer + OriginalContentMap)
       │
       ▼
 Adapted & Simplified Webpage UI
```

---

## 📁 Repository Ownership & Folder Structure

| Module | Location | Description | Key Responsibility |
| :--- | :--- | :--- | :--- |
| **AI Client & Prompts** | `src/ai/` | Gemma 3 Client, Zod Schemas, JSON Extractor, Prompts | AI inference & schema validation |
| **DOM Engine** | `src/dom/` | Page Analyzer, Safe DOM Executor, CSS Injector, Sanitizer | Reversible DOM mutations & styling |
| **Extension Shell** | `src/extension/` | Service Worker, Content Script, Popup, Messaging Router | IPC routing & extension lifecycle |
| **Form Assistant** | `src/forms/` | Form Classifier, Autofill Engine, Chat Assistant UI | Form prefilling & chat overlay |
| **UI Overlays** | `src/overlay/` | Chat Overlay, ToastManager, Design Tokens | User interface & toasts |

---

## 📊 Feature Status Table

| Feature | Status | Description |
| :--- | :--- | :--- |
| **Local Gemma 3 Integration** | ✅ DONE | Connected via Ollama (`/api/generate` & `/api/tags`) with 30s timeout retry. |
| **Ollama Health Check** | ✅ DONE | `checkOllamaHealth()` surfaces status (`ready`, `reachable_no_model`, `unreachable`) in Popup. |
| **Zod Schema Validation** | ✅ DONE | Single source of truth in `page-adaptation.schema.ts` with `.superRefine()`. |
| **CSS Safety Boundary** | ✅ DONE | `css-sanitizer.ts` blocks `@import`, `javascript:`, `expression()`, external `url()`. |
| **SPA Mutation Observer** | ✅ DONE | Debounced observer (800ms quiet) watching DOM churn settled state. |
| **Reversible DOM Engine** | ✅ DONE | `OriginalContentMap` restores 100% untouched DOM on `revertAll()`. |
| **Popup Dashboard** | ✅ DONE | Segmented mode switcher (`Minimal`, `Reader`, `Focus`, `Accessibility`) & Revert CTA. |
| **Toast Notifications** | ✅ DONE | Non-blocking auto-dismiss `ToastManager` with hover-to-pause. |
| **DevTools Console API** | ✅ DONE | `window.Sahayak` methods (`ask`, `health`, `highlight`, `revertAll`, `help`). |

---

## 🔑 Key Architectural Decisions

1. **CSS-Only Patches for Layout Adaptations**: Free-form styling from Gemma 3 is strictly restricted to sanitized CSS rules — zero arbitrary JS execution allowed from model text.
2. **2,000 Character Context Budget**: Extracted webpage context is capped via `compressContext()` to keep local Gemma 3 inference latency under 2 seconds.
3. **Long-Lived Messaging Ports**: Chat queries use `chrome.runtime.onConnect` ports (`sahayak-chat-port`) to prevent MV3 worker 30s timeout unloads.
4. **Zero Fallback Obfuscation**: If Ollama or model is unavailable, manifests are explicitly labeled (`Demo data — AI not connected`).
