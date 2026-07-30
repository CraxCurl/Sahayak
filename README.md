# Sahayak - AI Web Adapter Chrome Extension 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Chrome-Manifest%20V3-blue)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Local AI](https://img.shields.io/badge/AI-Local%20Gemma%203%20via%20Ollama-emerald)](https://ollama.com)

> **Sahayak** is an AI-powered Chrome Extension that dynamically adapts, simplifies, enhances, and personalizes any website to the user using local **Google Gemma 3** via **Ollama**.

---

## 🎯 Core Principle

> **The website adapts to the user.**
> **NOT**
> **The user adapts to the website.**

---

## 🌟 Key Features

1. **Adaptive UI Enhancement**: Dynamically highlights key action items and adjusts font contrast or layout.
2. **Website Simplification**: Converts complex jargon into simple, digestible language.
3. **AI Chat Assistant**: Context-aware site assistant powered by local Gemma 3.
4. **Intelligent Form Assistant**: Detects inputs and intelligently prefills form fields.
5. **Accessibility Enhancements**: Contrast ratio adjustments and font scaling.
6. **Non-Invasive Execution**: Never permanently alters target websites; mutations are ephemeral and non-destructive.
7. **100% Private & Local AI**: Zero cloud API keys, zero external tracking — runs locally via Ollama (`gemma3:4b`).

---

## 🏗 System Architecture & AI Flow

```text
Target Webpage Loaded
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

## 👥 Module Ownership & Team Breakdown

| Developer | Assigned Module | Key Directory | Responsibilities |
| :--- | :--- | :--- | :--- |
| **Developer 1** | Extension Core & Shell | `src/extension/` | Manifest V3, Service Worker, Popup UI, Chrome APIs, Message Router |
| **Developer 2** | DOM & Adaptive Engine | `src/dom/` | Page Analyzer, Action Executor, CSS Injector, Accessibility, Overlays |
| **Developer 3** | AI Layer & Ollama | `src/ai/` | Gemma 3 Prompts, Ollama Client, Zod JSON Parser, Decision Engine |
| **Developer 4** | Form & Preferences | `src/forms/` | Form Assistant, Autofill Engine, User Profile Store, Settings UI |

---

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, TailwindCSS, Vite
- **Extension**: Chrome Manifest V3, Content Scripts, Background Worker, Side Panel
- **State Management**: Zustand
- **Schema Validation**: Zod
- **Icons**: Lucide React
- **Local AI Engine**: Google Gemma 3 running locally on Ollama (`http://localhost:11434`)
- **Storage**: Chrome Storage API (`chrome.storage.local`)

---

## 🚀 Quick Start Guide

### Prerequisites
1. **Node.js**: >= 18.0.0 & npm >= 9.0.0
2. **Google Chrome**: Browser
3. **Ollama**: Download and install from [ollama.com](https://ollama.com)

### 1. Set Up Local Ollama & Gemma 3
```bash
# Pull and run Gemma 3 4B locally
ollama pull gemma3:4b
```
Ensure Ollama is running at `http://localhost:11434`.

### 2. Install & Build Extension
```bash
# Clone repository
git clone https://github.com/CraxCurl/Sahayak.git
cd Sahayak

# Install dependencies
npm install

# Build production extension package
npm run build
```

### 3. Load Extension in Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `dist/` directory inside `Sahayak`

---

## 📜 Development & Scripts

```bash
npm run dev        # Run Vite dev server with Hot Module Reloading
npm run build      # Compile TypeScript and build production extension package
npm run typecheck  # Validate TypeScript types across all modules
npm run lint       # Run ESLint check
npm run format     # Format code with Prettier
npm run test       # Run unit and integration tests with Vitest
```

---

## 🧠 Permanent Project Memory

Detailed architectural rules, data flow diagrams, coding standards, and future features are documented in [MEMORY.md](file:///c:/Users/vinay/Desktop/sahayak/Sahayak/MEMORY.md).

---

## 🤝 Contribution & Branching Policy

1. All feature work must be done in assigned feature branches named: `dev<1-4>/<feature-name>`
2. Follow [Conventional Commits](https://www.conventionalcommits.org/): e.g., `feat(dom): add safe text simplifier`
3. See [CONTRIBUTING.md](CONTRIBUTING.md) for full developer guidelines.

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for details.
