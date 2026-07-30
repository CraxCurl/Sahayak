# 🔬 DIAGNOSIS.md — Comprehensive Codebase Audit & Gap Analysis

> **Role & Mode**: Lead Software Architect & Senior Full-Stack Engineer  
> **Status**: PART 0 Deliverable — Complete Forensic Audit of `Sahayak` Codebase

---

## 1. File-by-File Inventory (`src/`)

| File Path | Description / Core Responsibility | Status & Wiring |
| :--- | :--- | :--- |
| `src/ai/api/gemma-client.ts` | Direct Google Cloud Gemma API HTTP client. | ❌ **Orphaned** (Not imported anywhere in the application). |
| `src/ai/api/ollama-client.ts` | Main local Ollama HTTP client (`/api/generate`, `/api/tags` model discovery, chat query, fallback generation). | ✅ **Wired** (Used by `service-worker.ts`). |
| `src/ai/chat/chat-assistant.ts` | Non-React standalone text chat helper class. | ❌ **Orphaned** (Replaced by `ChatAssistant.tsx`, only exported in `src/ai/index.ts`). |
| `src/ai/decision/decision-engine.ts` | `AIDecisionEngine` for filtering action manifests, resolving selector conflicts, and ranking priority. | ✅ **Wired** (Used by `ollama-client.ts`). |
| `src/ai/parser/json-parser.ts` | Helper function `parseAndValidateGemmaOutput` to strip markdown fences and validate JSON against Zod schema. | ✅ **Wired** (Used by `ollama-client.ts`). |
| `src/ai/prompts/gemma-templates.ts` | Legacy string templates for older Gemma prompt experiments. | ❌ **Orphaned** (Unused, superseded by `gemma3-prompts.ts`). |
| `src/ai/prompts/gemma3-prompts.ts` | `GEMMA3_PROMPTS` containing page analysis system prompts, chat prompts, and accessibility templates. | ✅ **Wired** (Used by `ollama-client.ts`). |
| `src/ai/schemas/action-schema.ts` | Zod validation schemas (`SahayakActionManifestSchema`, `ActionSchema`) for AI outputs. | ✅ **Wired** (Used by `json-parser.ts`). |
| `src/ai/index.ts` | Barrel export file for AI module. | ⚠️ **Partial** (Exports orphaned modules alongside active ones). |
| `src/dom/accessibility/accessibility-engine.ts` | `AccessibilityEngine` for font scaling, high contrast toggle, reduced motion, and focus enhancement. | ✅ **Wired** (Used by `SafeDOMExecutor`). |
| `src/dom/analyzer/page-analyzer.ts` | `PageAnalyzer` TreeWalker DOM context collector (headings, buttons, inputs, forms, visible text extract). | ✅ **Wired** (Used by `content-script.ts` and `ChatAssistant.tsx`). |
| `src/dom/engine/action-executor.ts` | `SafeDOMExecutor` action dispatcher loop (`HIGHLIGHT_ELEMENT`, `HIDE_ELEMENT`, `SIMPLIFY_TEXT`, `INJECT_CSS`, `ACCESSIBILITY_ENHANCE`) and `revertAll()` restoration. | ✅ **Wired** (Used by `content-script.ts`). |
| `src/dom/injector/css-injector.ts` | `CSSInjector` creating scoped `<style id="sahayak-css-*">` elements in `<head>`. | ✅ **Wired** (Used by `SafeDOMExecutor` & `AccessibilityEngine`). |
| `src/dom/overlays/chat-overlay.ts` | `ChatOverlayManager` mounting Shadow DOM root (`#sahayak-chat-shadow-host`) and React root for `ChatAssistant`. | ✅ **Wired** (Used by `content-script.ts`). |
| `src/dom/overlays/FloatingToolbar.tsx` | Standalone floating toolbar React component. | ❌ **Orphaned** (Not mounted or imported in `content-script.ts`). |
| `src/dom/overlays/shadow-overlay.ts` | Helper class for Shadow DOM mounting. | ❌ **Orphaned** (Only imported in unused `FloatingToolbar.tsx` and barrel export). |
| `src/dom/reader/reader-mode.ts` | `ReaderMode` DOM article extractor and reader view builder. | ❌ **Orphaned** (Not wired into content script or active UI). |
| `src/dom/index.ts` | Barrel export file for DOM module. | ⚠️ **Partial** (Exports orphaned modules alongside active ones). |
| `src/extension/background/service-worker.ts` | MV3 Service Worker message router for `AI_RUN_ANALYSIS`, `CHAT_QUERY_REQUEST`, `HIGHLIGHT_TARGET_ELEMENT`. | ✅ **Wired** (Extension background entrypoint). |
| `src/extension/content/content-script.ts` | Extension content script entrypoint, auto-analyzer, message listener, and `window.Sahayak` DevTools API host. | ✅ **Wired** (Extension content script entrypoint). |
| `src/extension/messaging/message-router.ts` | Static wrapper for `chrome.runtime.sendMessage` and `chrome.tabs.sendMessage`. | ✅ **Wired** (Used by `PopupApp.tsx` and `ChatAssistant.tsx`). |
| `src/extension/popup/PopupApp.tsx` | Main extension Popup UI (`popup.html`). | ✅ **Wired** (Used as `default_popup` in `manifest.json`). |
| `src/extension/storage/chrome-storage.ts` | `ChromeStorageService` typed wrapper over `chrome.storage.local`. | ✅ **Wired** (Used by `PopupApp.tsx` and `SettingsApp.tsx`). |
| `src/extension/index.ts` | Barrel export file for extension module. | ✅ **Wired** (Used for index imports). |
| `src/forms/assistant/ChatAssistant.tsx` | React Chat UI component for floating overlay and sidepanel. | ✅ **Wired** (Used by `chat-overlay.ts`). |
| `src/forms/assistant/form-detector.ts` | `FormDetector` class for form field classification. | ❌ **Orphaned** (Only exported in `forms/index.ts`, unused). |
| `src/forms/personalization/user-profile.ts` | `UserProfileManager` storing user accessibility preferences. | ✅ **Wired** (Used by storage/settings). |
| `src/forms/settings/SettingsApp.tsx` | Extension options/settings page React app (`options.html`). | ✅ **Wired** (Used as `options_page` in `manifest.json`). |
| `src/forms/index.ts` | Barrel export file for forms module. | ⚠️ **Partial** (Exports orphaned modules alongside active ones). |
| `src/shared/constants/index.ts` | Shared storage key constants (`SAHAYAK_CONSTANTS`). | ✅ **Wired** (Used across background and popup). |
| `src/shared/stores/useAppStore.ts` | Zustand store for UI active state and current tab metadata. | ✅ **Wired** (Used by `PopupApp.tsx`). |
| `src/shared/stores/useUserPreferencesStore.ts` | Zustand store for accessibility preferences. | ✅ **Wired** (Used by `PopupApp.tsx` and `SettingsApp.tsx`). |
| `src/shared/types/ai-actions.ts` | TypeScript type declarations for action manifests. | ✅ **Wired** (Core type source). |
| `src/shared/types/messages.ts` | TypeScript type declarations for IPC message payload map and union types. | ✅ **Wired** (Core message protocol contract). |
| `src/vite-env.d.ts` | Vite client type reference declarations. | ✅ **Wired** (TypeScript config). |

---

## 2. Claimed vs. Actual Features

| Feature | Docs Say | Code Actually Does | Verdict |
| :--- | :--- | :--- | :--- |
| **Local AI Inference (Gemma 3)** | Runs Gemma 3 via local Ollama API to analyze websites. | Calls `/api/generate` on Ollama, but silently catches fetch errors and falls back to hardcoded mock manifests without warning the user. | 🟡 **Partial** |
| **Model Health & Status Detection** | Auto-detects local Ollama status and alerts user if Ollama is down. | Tries `/api/tags` internally in `ollama-client.ts`, but Popup UI only checks basic ping without reporting specific states (`unreachable`, `reachable_no_model`, `ready`). | 🟡 **Partial** |
| **DOM UI Simplification** | Hides clutter, highlights primary buttons, and simplifies jargon text. | `SafeDOMExecutor` executes `HIDE_ELEMENT`, `HIGHLIGHT_ELEMENT`, and `SIMPLIFY_TEXT`. Reversion (`revertAll()`) works cleanly. | 🟢 **Working** |
| **Context-Aware AI Chat Assistant** | Answers questions about the current page using webpage extracts. | `ChatAssistant.tsx` sends queries via `service-worker.ts` to Ollama. Fallback constructs domain summary, but queries over 1s risk service worker termination. | 🟡 **Partial** |
| **Shadow DOM Overlay Isolation** | Floating assistant UI is completely isolated from host webpage styles. | `ChatOverlayManager` attaches open `ShadowRoot` and injects shadow styles, preventing style bleeding. | 🟢 **Working** |
| **DevTools Console API** | Developers can operate extension features directly from Chrome console. | `window.Sahayak` exposes `highlight`, `simplifyText`, `hideElement`, `injectCSS`, `autofill`, `revertAll`, `ask`, and `help`. | 🟢 **Working** |
| **Smart Form Autofill** | Predicts and pre-fills complex form fields based on user profile. | `AUTOFILL_FORM` action type exists in `SafeDOMExecutor`, but `form-detector.ts` is orphaned and autofill is not wired to AI model prompts. | 🔴 **Stubbed** |
| **Reader Mode View** | Provides a clean, distraction-free reading overlay for articles. | `reader-mode.ts` and `FloatingToolbar.tsx` exist in codebase but are completely orphaned and unmounted. | 🔴 **Stubbed** |

---

## 3. Errors, Catch Blocks & Silent Fallbacks Audit

| File:Line | Code Block / Trigger | Handled vs. Swallowed | User Impact |
| :--- | :--- | :--- | :--- |
| `src/ai/api/ollama-client.ts:87` | `catch (err)` in `generatePageAdaptation` | **Swallowed** (Logs `console.warn` and returns fallback mock manifest) | User sees mock data without knowing Ollama failed or model was missing. |
| `src/ai/api/ollama-client.ts:138` | `catch (err)` in `askPageQuestion` | **Swallowed** (Logs `console.warn` and returns `getFallbackChatAnswer`) | User gets local rule-based answer without notification that Ollama failed. |
| `src/ai/parser/json-parser.ts:40` | `catch (error)` in `parseAndValidateGemmaOutput` | **Swallowed** (Logs `console.error` and returns fallback empty manifest) | Invalid JSON from model silently yields fallback manifest without retry. |
| `src/extension/content/content-script.ts:33` | `catch (err)` in `triggerAutoAnalysis` | **Swallowed** (Logs `console.warn`) | Page analysis failure fails silently in background. |
| `src/extension/background/service-worker.ts:64` | `catch (err)` in `AI_RUN_ANALYSIS` handler | **Surfaced via IPC** (`sendResponse({ success: false, error })`) | Returned to content script caller, but content script does not render toast error. |
| `src/extension/background/service-worker.ts:110` | `catch (err)` in `CHAT_QUERY_REQUEST` handler | **Surfaced via IPC** (`sendResponse({ success: false, error })`) | Chat assistant receives failure response and triggers local fallback response. |
| `src/dom/engine/action-executor.ts:28` | `catch (err)` in `executeSingleAction` | **Swallowed** (Logs `console.error`) | Single failed DOM action is skipped without breaking remaining manifest. |
| `src/dom/engine/action-executor.ts:47` | Target selector not found in `executeSingleAction` | **Swallowed** (Logs `console.warn`) | Action skipped silently if selector missing from current DOM. |

---

## 4. Manifest & Permissions Audit (`manifest.json`)

```json
{
  "manifest_version": 3,
  "name": "Sahayak - AI Web Adapter",
  "version": "1.0.0",
  "description": "AI-powered browser extension adapting any webpage using Google Gemma",
  "permissions": [
    "activeTab",
    "storage",
    "scripting",   // ⚠️ UNUSED: chrome.scripting API is never called in the codebase
    "sidePanel"
  ],
  "options_page": "options.html",
  "host_permissions": [
    "<all_urls>"   // ⚠️ INSUFFICIENT FOR OLLAMA: MV3 requires explicit "http://localhost:11434/*" and "http://127.0.0.1:11434/*"
  ],
  "background": {
    "service_worker": "src/extension/background/service-worker.ts",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"], // ⚠️ TOO BROAD: Missing exclude_matches for chrome://*, chrome-extension://*, about:*
      "js": ["src/extension/content/content-script.ts"],
      "run_at": "document_idle"
    }
  ]
}
```

### Manifest Audit Findings:
1. **Unused Permission**: `"scripting"` is declared in `permissions`, but `chrome.scripting` is never invoked anywhere.
2. **Missing Host Permissions**: `"<all_urls>"` does not reliably grant access to loopback origins `http://localhost:11434/*` and `http://127.0.0.1:11434/*` in Chrome MV3.
3. **Overly Broad Content Script Matching**: `"matches": ["<all_urls>"]` attempts to inject content scripts into internal browser pages (`chrome://`, `chrome-extension://`), generating console errors.

---

## 5. Message Contract Audit

| Message Type | Sender | Receiver | Payload Sent | Payload Expected | Contract Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `AI_RUN_ANALYSIS` | `content-script.ts` | `service-worker.ts` | `{ textSummary: string, userPreferences: object }` | `{ textSummary: string, userPreferences: Record<string, unknown> }` | 🟢 **Matches** |
| `AI_ACTIONS_READY` | `service-worker.ts` | `content-script.ts` | `{ manifest: SahayakActionManifest }` | `{ manifest: SahayakActionManifest }` | 🟢 **Matches** |
| `CHAT_QUERY_REQUEST` | `ChatAssistant.tsx` / `window.Sahayak` | `service-worker.ts` | `{ question: string, pageUrl: string, textSummary: string }` | `{ question: string, pageUrl: string, textSummary: string }` | 🟢 **Matches** |
| `CHAT_QUERY_RESPONSE` | `service-worker.ts` | `ChatAssistant.tsx` | `{ answer: string, highlightSelector?: string }` | `{ answer: string, highlightSelector?: string }` | 🟢 **Matches** |
| `HIGHLIGHT_TARGET_ELEMENT` | `service-worker.ts` / `ChatAssistant.tsx` | `content-script.ts` | `{ selector: string, label?: string }` | `{ selector: string, label?: string }` | 🟢 **Matches** |
| `SAHAYAK_TOGGLE_STATE` | `PopupApp.tsx` | `content-script.ts` | `{ active: boolean }` | `{ active: boolean }` | 🟢 **Matches** |
| `DOM_ANALYZE_PAGE` | `service-worker.ts` / `MessageRouter` | `content-script.ts` | `{ pageUrl: string, forceFresh?: boolean }` | `{ pageUrl: string, forceFresh?: boolean }` | 🟢 **Matches** |
| `PING_BACKGROUND` | `PopupApp.tsx` / `MessageRouter` | `service-worker.ts` | `{ timestamp: number }` | `{ timestamp: number }` | 🟢 **Matches** |

---

## 6. End-to-End Failure Reproduction Steps & Top 3 Root Causes

### Reproduction Steps:
1. Stop Ollama or launch without `OLLAMA_ORIGINS` configured (`ollama serve` without CORS header).
2. Open Chrome, navigate to any complex website (e.g. `https://wikipedia.org` or `https://news.ycombinator.com`).
3. Click the Sahayak extension icon to open the Popup UI, or turn the extension toggle ON.
4. **Observed Result**:
   - The content script sends `AI_RUN_ANALYSIS` to the background service worker.
   - Background service worker attempts `fetch('http://localhost:11434/api/generate')`.
   - The fetch fails with `net::ERR_FAILED` or `CORS blocked` or `404 Model Not Found`.
   - `OllamaGemmaClient` silently catches the error and returns a mock fallback manifest.
   - The webpage applies the mock fallback manifest, giving the user the illusion that local AI ran when it actually failed silently!
   - Service worker console logs a `console.warn`, but no error message or setup instructions appear in the extension UI.

---

### 🚨 Top 3 Suspected Root Causes (with Evidence)

1. **Silent Fallback & Masked Failures in `OllamaGemmaClient`**:
   - *Evidence*: `src/ai/api/ollama-client.ts:87-93` catches all Ollama fetch failures and returns `getFallbackMockManifest()`. This disguises connection drops, missing models, and CORS errors as successful AI executions, hiding root failures from developers and users.
2. **Missing Loopback Host Permissions & CORS Instructions**:
   - *Evidence*: `manifest.json` lacks explicit `http://localhost:11434/*` and `http://127.0.0.1:11434/*` declarations. Furthermore, standard `ollama serve` blocks Chrome Extension origins (`chrome-extension://<id>`) unless `OLLAMA_ORIGINS` environment variable is explicitly configured.
3. **MV3 Service Worker Ephemeral Lifecycle & One-Shot Message Timeouts**:
   - *Evidence*: `service-worker.ts` uses single-shot `chrome.runtime.sendMessage` callbacks for multi-second Ollama LLM requests. Chrome MV3 service workers unload after 30 seconds of inactivity or drop callbacks mid-flight, causing unhandled promise rejections or orphaned chat requests.

---

*End of DIAGNOSIS.md — Stopping for review before proceeding to Part 1.*
