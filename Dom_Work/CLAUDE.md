# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## What this is

**Sahayak** is a Chrome Extension (Manifest V3) that adapts any website to the user using local **Google Gemma 3** running on **Ollama** (`http://localhost:11434`). The website adapts to the user — not the user to the website. Strictly local AI: no cloud keys, no external calls.

The codebase is structured around a **four-developer module ownership model** (see `README.md` "Module Ownership & Team Breakdown" and `docs/ARCHITECTURE.md`). Every file in `src/` belongs to exactly one owner.

---

## Commands

All commands run from the repo root with `npm` (Node ≥ 18).

| Task | Command |
| :--- | :--- |
| Dev server / HMR | `npm run dev` |
| **Production build** (type-check + Vite extension bundle to `dist/`) | `npm run build` |
| TypeScript strict check only | `npm run typecheck` |
| ESLint | `npm run lint` / `npm run lint:fix` |
| Prettier format / check | `npm run format` / `npm run format:check` |
| Unit/integration tests | `npm run test` (watch: `npm run test:watch`) |
| Preview the built extension | `npm run preview` |

**CI gate** (`.github/workflows/ci.yml`, runs on push/PR to `main` and `develop`): `typecheck → lint → format:check → build`. All four must pass. The PR template (`/.github/PULL_REQUEST_TEMPLATE.md`) explicitly requires this before review.

**Load the built extension in Chrome**: `chrome://extensions/` → Developer mode → **Load unpacked** → select `dist/`.

**Local AI prerequisite**: install [Ollama](https://ollama.com) and `ollama pull gemma3:4b`. Without it, the extension falls back to a local stub manifest (see `OllamaGemmaClient.getFallbackMockManifest`).

---

## Module ownership — the single most important rule

Per `MEMORY.md` and `docs/ARCHITECTURE.md` §3, **feature modules MUST NOT import directly from each other**:

| Directory | Owner | Scope |
| :--- | :--- | :--- |
| `src/extension/` | **Developer 1** | Manifest V3, Service Worker, Content Script loading, Popup, Message Router, Chrome Storage wrappers |
| `src/dom/` | **Developer 2** | Page Analyzer, Safe Action Executor, Dynamic CSS Injection, Accessibility, Overlays |
| `src/ai/` | **Developer 3** | Ollama / Gemma 3 client, prompts, Zod schema, parser, decision engine |
| `src/forms/` | **Developer 4** | Form detector, Autofill engine, Preferences store, Settings UI |
| `src/shared/` | **All** | Types, Zustand stores, constants, hooks, utilities |

Cross-module communication goes through **`@shared/types`** (typed message contracts), **`@shared/stores`** (Zustand), or **Chrome runtime messages**. Vite aliases + `tsconfig.paths`: `@ai/*`, `@dom/*`, `@extension/*`, `@forms/*`, `@shared/*`.

The PR template makes this a checkbox: *"No direct imports between isolated feature modules were introduced"*.

---

## Non-negotiable rules (from `MEMORY.md` §📜)

1. **No cloud AI APIs.** Strictly local Ollama. Do not add Google Gemini / OpenAI / etc. clients to the runtime path. (`src/ai/api/gemma-client.ts` exists as a cloud variant — do not extend or wire it in.)
2. **AI never mutates the DOM directly.** It returns JSON (`SahayakActionManifest`) and only `src/dom/engine/action-executor.ts` (the DOM Engine) touches page DOM.
3. **Mutations are ephemeral and reversible.** `SafeDOMExecutor` keeps `originalContentMap`; add a corresponding branch in `revertAll()` for any new action type.
4. **AI output is JSON validated by Zod** via `parseAndValidateGemmaOutput()`. Add new action kinds in BOTH `src/shared/types/ai-actions.ts` AND the Zod discriminated union in `src/ai/schemas/action-schema.ts`.
5. **Chrome storage writes** go through `ChromeStorageService` (`src/extension/storage/chrome-storage.ts`), not raw `chrome.storage.local`.

---

## Architecture & execution flow

```text
Webpage loaded
  → Content Script (Dev 1) runs PageAnalyzer (Dev 2)
  → Sends AI_RUN_ANALYSIS → Service Worker (Dev 1)
  → Service Worker calls OllamaGemmaClient (Dev 3)
  → Raw text → parseAndValidateGemmaOutput (Zod) → SahayakActionManifest
  → Service Worker replies AI_ACTIONS_READY to content script
  → Content Script hands manifest to SafeDOMExecutor (Dev 2)
  → Non-destructive DOM mutations applied
```

Message contracts are typed in `src/shared/types/messages.ts` via the `ExtensionMessage` discriminated union + `MessagePayloadMap`. The string union `MessageType` there must stay in sync with what `MessageRouter`, the service worker, and the content script send.

---

## Things that are easy to get wrong

- **Action schema drift.** `ai-actions.ts` declares 6 action types (`HIGHLIGHT_ELEMENT`, `HIDE_ELEMENT`, `SIMPLIFY_TEXT`, `INJECT_CSS`, `AUTOFILL_FORM`, `ACCESSIBILITY_ENHANCE`) but `action-schema.ts`'s Zod discriminated union only handles the first 4. AI JSON containing `AUTOFILL_FORM` or `ACCESSIBILITY_ENHANCE` will currently fail validation. If you add action types, update both files.
- **MessageRouter.** `src/extension/messaging/message-router.ts` only exposes `send()`. The popup calls raw `chrome.tabs.sendMessage` — Dev 1 hygiene gap. Add `sendToTab()` and route the popup through it.
- **`SETTINGS_UPDATE` message type** is declared but no module sends it. `SettingsApp.tsx` writes direct to `chrome.storage.local.set`, bypassing the contract. If you fix this, use `ChromeStorageService.setUserPreferences()` and emit `SETTINGS_UPDATE`.
- **Tailwind `content` lists `options.html`** (`tailwind.config.js`) but that file doesn't exist — stale config; leave or remove.
- **`SidePanel` permission granted but no `chrome.sidePanel.setOptions()`** is called anywhere. Currently relies on `default_path` only.
- **`@shared/stores` are unused** despite `MEMORY.md` advertising them. The popup uses local React `useState` instead. New global state belongs in these stores.
- **Bundle file references `SettingsApp.tsx`** from `src/forms/` even though `sidepanel.html` is in the project root. After a Vite build the result works because `crx` rewrites paths, but if you move it, also update `sidepanel.html`.
- **Placeholders in `assets/icons/`** are 1×1 PNGs (70 bytes). Replace before shipping.

---

## Conventions

- **Commits**: Conventional Commits with the module prefix: `feat(dom): …`, `fix(extension): …`, `docs(memory): …` (see `CONTRIBUTING.md`).
- **Branches**: `dev<1-4>/<feature-name>` per developer.
- **TypeScript**: strict, no `any` (ESLint enforces). Public functions need explicit return types.
- **React**: functional components + hooks.
- **State**: Zustand (`useAppStore`, `useUserPreferencesStore`) for anything cross-component; React `useState` is fine for local-only UI state.
- **Parsing external data**: wrap in Zod `.parse()` / `.safeParse()`. Examples: `parseAndValidateGemmaOutput`, `ChromeStorageService.get`.
- **Tailwind** is scoped to the extension popup. `assets/styles/global.css` defines `.sahayak-simplified` and `.sahayak-highlight` classes — these are the only styles meant to be injected into target pages.

---

## Key files to read first

When unsure, these four orient almost any question:

- `MEMORY.md` — non-negotiable rules, folder conventions, roadmap
- `docs/ARCHITECTURE.md` — sequence diagram and module boundary table
- `src/shared/types/messages.ts` — IPC contract
- `src/shared/types/ai-actions.ts` + `src/ai/schemas/action-schema.ts` — what the AI is allowed to emit
