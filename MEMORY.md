# Sahayak - Project Memory & Architecture Guide

> **CRITICAL**: Every future coding session, AI subagent, or developer working on Sahayak **MUST** read this file before writing code or modifying files.

---

## 👁 Project Vision

**Sahayak** is an open-source, local AI-powered browser extension designed to adapt any website to the user instead of forcing users to adapt to complex, inaccessible, or overwhelming websites.

---

## 🎯 Core Principle

> **The website adapts to the user.**
> **NOT**
> **The user adapts to the website.**

Sahayak acts as an intelligent intermediary layer that reads webpage context, predicts user needs, simplifies complex jargon, prefills forms, highlights critical actions, and enhances accessibility dynamically and ephemerally.

---

## 🏗 Current Architecture Stack

- **Language**: TypeScript (Strict Mode)
- **Frontend Framework**: React 18
- **Build Tool / Bundler**: Vite + `@crxjs/vite-plugin`
- **Styling**: TailwindCSS (Scoped to extension & Shadow DOM)
- **Extension Architecture**: Chrome Extension Manifest V3 (Background Service Worker, Content Scripts, Popup, Side Panel)
- **State Management**: Zustand
- **Schema Validation**: Zod
- **Icons**: Lucide React
- **Storage**: Chrome Storage API (`chrome.storage.local`)
- **AI Backend**: **Gemma 3** running **LOCALLY via Ollama** (`http://localhost:11434`)
- **Cloud API Keys**: **ZERO** (Strictly Local AI execution)

---

## 🔄 AI Execution Flow

```text
Webpage Loaded
      ↓
DOM Extract & Page Analysis (Developer 2 / Content Script)
      ↓
Context Builder & Prompt Formatter (Developer 3 / AI Module)
      ↓
Local Ollama Request (http://localhost:11434/api/generate - Gemma 3)
      ↓
Raw Response Parsing & Zod Schema Validation (Developer 3)
      ↓
Structured Action JSON Manifest (SahayakActionManifest)
      ↓
Decision Engine Filtering & Confidence Thresholding (Developer 3)
      ↓
Safe DOM Engine Execution & Dynamic CSS Injection (Developer 2)
      ↓
Adapted & Simplified Webpage UI
```

---

## 📜 Non-Negotiable Rules

1. **NO Cloud AI APIs**: Never make requests to Google Gemini Cloud, OpenAI, or third-party paid APIs.
2. **NO API Keys**: The extension must work out-of-the-box using local Ollama (`ollama run gemma3:4b`).
3. **Local Ollama Priority**: All AI inferences target `http://localhost:11434`.
4. **JSON Output Only**: The AI module must strictly return structured JSON validated via Zod.
5. **AI NEVER Manipulates the DOM Directly**: The AI only emits intent in JSON format.
6. **DOM Engine Isolation**: Only the DOM Engine (`src/dom/`) touches target webpage DOM nodes.
7. **Ephemeral Mutations**: Original DOM nodes and styles MUST be restorable. Webpages are never mutated permanently on disk/server.
8. **Shared Code Placement**: Shared types, interfaces, constants, and utilities belong strictly inside `src/shared/`.
9. **Feature Module Isolation**: `src/ai`, `src/dom`, `src/extension`, and `src/forms` MUST NOT import directly from each other. They communicate via `@shared/events` or Chrome runtime messaging.

---

## 👥 Team Ownership & Module Boundaries

| Module Folder | Primary Developer | Scope & Responsibilities |
| :--- | :--- | :--- |
| `src/extension/` | **Developer 1** | Chrome Manifest V3 setup, Background Service Worker, Content script injection, Popup React app, Chrome Storage API wrappers, Typed Message Router. |
| `src/dom/` | **Developer 2** | DOM Page Analyzer, Safe Action Executor, Dynamic CSS Injector, Accessibility Engine, Overlay Components (Shadow DOM), Website Simplification Engine. |
| `src/ai/` | **Developer 3** | Local Ollama Client, Gemma 3 Prompt Templates, Zod JSON Response Parser, Decision Engine, Context-aware Chat Assistant. |
| `src/forms/` | **Developer 4** | Intelligent Form Detector, Smart Autofill Engine, Personalization Store, User Preferences, Settings React UI. |
| `src/shared/` | **All Team** | Common Types, Shared Interfaces, Event Bus, Custom Hooks, Zustand Stores, Constants, Utility Helpers, Design System UI primitives. |

---

## 📁 Folder Conventions

```text
src/
├── ai/
│   ├── api/             # Ollama HTTP fetch client
│   ├── decision/        # AI Decision engine & confidence filtering
│   ├── parser/          # Zod schema validation & markdown cleanup
│   ├── prompts/         # Gemma 3 prompt templates
│   └── schemas/         # Zod schemas for AI JSON responses
├── dom/
│   ├── accessibility/   # Contrast, font, aria helpers
│   ├── analyzer/        # DOM text & element extractor
│   ├── engine/          # Action executor (Highlights, Hides, Simplifies)
│   ├── injector/        # Scoped CSS injection manager
│   └── overlays/        # React Shadow DOM floating controls
├── extension/
│   ├── background/      # Service worker lifecycle & alarms
│   ├── content/         # Content script entry script
│   ├── messaging/       # Extension IPC message bus
│   ├── popup/           # Extension popup application
│   └── storage/         # Chrome Storage API wrapper
├── forms/
│   ├── assistant/       # Form field detection & classifier
│   ├── personalization/ # User persona matcher
│   ├── preferences/     # Accessibility & theme preference manager
│   └── settings/        # Settings UI (Options / SidePanel)
└── shared/
    ├── components/      # Shared atomic React UI components
    ├── constants/       # Global constants & default values
    ├── events/          # Event bus & typed IPC contracts
    ├── hooks/           # Reusable React hooks
    ├── services/        # Logger, crypto, storage services
    ├── stores/          # Zustand global state stores
    ├── types/           # Shared TypeScript interfaces & types
    └── utils/           # Pure utility helper functions
```

---

## 💻 Coding Standards

1. **Strict TypeScript**: Every file must be written in TypeScript with explicit return types for public functions. Avoid `any` at all costs.
2. **Functional React**: Use React 18 functional components with hooks.
3. **Zustand State Management**: Global state across extension components uses Zustand stores in `src/shared/stores/`.
4. **Zod Parsing**: Always wrap external data (Ollama outputs, Chrome storage loads) in Zod `.parse()` or `.safeParse()`.
5. **No Code Duplication**: Extract common helper functions into `src/shared/utils/` and reusable hooks into `src/shared/hooks/`.
6. **Clean Shadow DOM Isolation**: Overlays on target websites must render inside Shadow DOM to avoid CSS leaks.

---

## 🚀 Future Features Roadmap

- [ ] **Voice Mode**: Speech-to-text navigation and page querying.
- [ ] **Reader Mode**: Clean distraction-free AI reading layout.
- [ ] **Accessibility Profiles**: Presets for Dyslexia, Low Vision, and ADHD focus modes.
- [ ] **AI Navigation Guide**: Step-by-step element guidance for complex web portals.
- [ ] **Advanced Form Assistant**: Multi-step application autofill with persona switching.
- [ ] **Cross-Browser Support**: Firefox Manifest V3 and Edge compatibility.
