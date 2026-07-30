# Folder Structure & Module Ownership

> This document explains every directory and file in the Sahayak project, its purpose, and which developer owns it.

---

## Root Directory

```
Sahayak/
├── .github/                    # GitHub templates & CI workflows
│   ├── ISSUE_TEMPLATE/         # Bug report & feature request templates
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/ci.yml        # Lint + Build CI pipeline
├── assets/icons/               # Extension icons (16, 48, 128px)
├── demo-website/               # Hackathon demo portal (scholarship form)
├── dist/                       # Vite production build output
├── docs/                       # Architectural documentation suite
├── presentation/               # Hackathon demo & slide guides
├── src/                        # Application source code
├── tests/                      # Vitest unit & integration tests
├── manifest.json               # Chrome Extension Manifest V3
├── popup.html                  # Extension popup HTML entry
├── sidepanel.html              # Extension side panel HTML entry
├── options.html                # Extension options page HTML entry
├── vite.config.ts              # Vite + CRXJS build configuration
├── tsconfig.json               # TypeScript strict compiler config
├── tailwind.config.js          # TailwindCSS configuration
├── package.json                # Dependencies & npm scripts
├── MEMORY.md                   # Permanent project memory (MUST be read first)
├── README.md                   # Project overview & setup guide
├── CONTRIBUTING.md             # Developer workflow & commit conventions
├── CHANGELOG.md                # Version release history
├── CODE_OF_CONDUCT.md          # Contributor Covenant
└── LICENSE                     # MIT License
```

---

## Source Code (`src/`)

```
src/
├── ai/                    # Developer 3 — AI Layer & Ollama
│   ├── api/               # Ollama HTTP client & GemmaClient wrapper
│   ├── chat/              # Chat assistant AI logic
│   ├── decision/          # AI Decision Engine (confidence filtering, conflict resolution)
│   ├── parser/            # Zod JSON response parser & markdown cleanup
│   ├── prompts/           # Gemma 3 system instructions & prompt templates
│   ├── schemas/           # Zod schemas for SahayakActionManifest
│   └── index.ts           # Public API barrel exports
│
├── dom/                   # Developer 2 — DOM Engine & Adaptive UI
│   ├── accessibility/     # High contrast, font scaling, focus outlines, ARIA fixes, reduced motion
│   ├── analyzer/          # Page context extraction (headings, buttons, forms, ARIA roles)
│   ├── engine/            # SafeDOMExecutor (highlight, hide, simplify, autofill, inject CSS)
│   ├── injector/          # Scoped dynamic CSS injection manager
│   ├── overlays/          # Shadow DOM floating toolbar & chat overlay
│   ├── reader/            # Simplification Engine (Reader, Focus, Minimal, Beginner modes)
│   └── index.ts           # Public API barrel exports
│
├── extension/             # Developer 1 — Chrome Extension Core
│   ├── background/        # Service Worker (message routing, Ollama orchestration)
│   ├── content/           # Content script (DOM analysis trigger, action execution)
│   ├── messaging/         # Typed message router utility
│   ├── popup/             # Extension popup React app
│   ├── storage/           # Chrome Storage API wrapper service
│   └── index.ts           # Public API barrel exports
│
├── forms/                 # Developer 4 — Forms & Preferences
│   ├── assistant/         # Form field detector, ChatAssistant React component
│   ├── personalization/   # User profile store (name, email, aadhaar, etc.)
│   ├── settings/          # Settings React UI (side panel)
│   └── index.ts           # Public API barrel exports
│
└── shared/                # All Developers — Shared Utilities
    ├── constants/         # Global constants & default values
    ├── stores/            # Zustand global state stores
    └── types/             # Shared TypeScript interfaces & message contracts
```

---

## Module Ownership

| Module | Owner | Responsibilities |
|:---|:---|:---|
| `src/extension/` | Developer 1 | Manifest V3, Service Worker, Popup UI, Chrome APIs, Message Router |
| `src/dom/` | Developer 2 | Page Analyzer, DOM Executor, CSS Injector, Accessibility, Overlays, Simplification |
| `src/ai/` | Developer 3 | Ollama Client, Gemma 3 Prompts, Zod Parser, Decision Engine, Chat AI |
| `src/forms/` | Developer 4 | Form Detector, Autofill, User Profile, Settings UI, ChatAssistant UI |
| `src/shared/` | All | Types, Interfaces, Constants, Zustand Stores |
