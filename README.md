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
2. **Google Chrome**: Browser (version 116+ for Side Panel support)
3. **Ollama**: Local AI inference engine — see setup below

---

## 🤖 Ollama & Gemma 3 Setup Guide

Sahayak uses **Google Gemma 3 (4B)** running locally via **Ollama**. This means all AI processing stays on your machine — no cloud API keys, no data leaving your device.

### Step 1: Install Ollama

#### Windows
1. Download the installer from [ollama.com/download](https://ollama.com/download)
2. Run the `.exe` installer and follow the prompts
3. Ollama will run as a system tray application

#### macOS
```bash
# Using Homebrew
brew install ollama

# Or download from https://ollama.com/download
```

#### Linux
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Step 2: Pull the Gemma 3 Model
```bash
# Pull the 4B parameter model (recommended — ~3GB download)
ollama pull gemma3:4b

# Verify it downloaded successfully
ollama list
```

### Step 3: Verify Ollama is Running
```bash
# Start Ollama (if not already running)
ollama serve

# Test it works (in another terminal)
curl http://localhost:11434/api/tags
```
You should see a JSON response listing `gemma3:4b`.

### Step 4: Configure Network Access (For Team / Remote Use)

> **Skip this step** if you're only using Sahayak on the same machine running Ollama.

If your laptop is the **central AI host** and teammates connect to it over Wi-Fi:

#### Windows (PowerShell — Run as Administrator)
```powershell
# Set environment variables system-wide
[System.Environment]::SetEnvironmentVariable("OLLAMA_HOST", "0.0.0.0:11434", "Machine")
[System.Environment]::SetEnvironmentVariable("OLLAMA_ORIGINS", "*", "Machine")

# Restart Ollama after setting these
# Close the Ollama tray icon → relaunch Ollama
```

#### macOS / Linux
```bash
# Add to ~/.bashrc or ~/.zshrc
export OLLAMA_HOST="0.0.0.0:11434"
export OLLAMA_ORIGINS="*"

# Then restart Ollama
source ~/.bashrc  # or ~/.zshrc
ollama serve
```

#### Find Your Local IP
```bash
# Windows
ipconfig    # Look for Wi-Fi adapter → IPv4 Address (e.g., 192.168.1.100)

# macOS/Linux
ifconfig | grep "inet "    # or: ip addr show
```

#### Firewall: Allow Ollama Port
Make sure port **11434** is open in your firewall for incoming connections on your local network.

### Step 5: Configure the `.env` File

Copy the example env file and configure your Ollama URL:

```bash
cp .env.example .env
```

Edit `.env`:
```env
# If Ollama is on the SAME machine:
VITE_OLLAMA_URL=http://localhost:11434

# If connecting to a REMOTE host laptop (replace with actual IP):
VITE_OLLAMA_URL=http://192.168.1.100:11434

# Model to use (default)
VITE_OLLAMA_MODEL=gemma3:4b
```

> You can also change the Ollama URL at runtime from the **Settings** page inside the extension (gear icon → Settings tab → Local Ollama Server Endpoint).

---

## 🔧 Build & Load the Extension

### 1. Install & Build
```bash
# Clone repository
git clone https://github.com/CraxCurl/Sahayak.git
cd Sahayak

# Install dependencies
npm install

# Build production extension package
npm run build
```

### 2. Load Extension in Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the **`dist/`** directory inside `Sahayak/`
5. The Sahayak icon should appear in your toolbar

### 3. Test It
1. Navigate to any regular webpage (e.g., `https://example.com`)
2. Click the Sahayak extension icon in the toolbar
3. Click **"Extract Webpage Information"** — you should see page data
4. Click **"Send to AI Module"** — Gemma 3 will analyze and adapt the page
5. Click the **gear icon** ⚙️ to open Settings & AI Chat

---

## ⚠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| **"Extract" button shows error** | Make sure you're on a regular webpage (not `chrome://` or `edge://` pages). Reload the tab and try again. |
| **"Ollama model returned an invalid response"** | Ensure Ollama is running (`ollama serve`) and the model is pulled (`ollama list`). |
| **Settings gear does nothing** | Ensure the extension is loaded in Developer Mode and `options_page` is declared in `manifest.json`. |
| **Connection refused on remote host** | Check that `OLLAMA_HOST=0.0.0.0:11434` is set, Ollama is restarted, and firewall allows port 11434. |
| **Extension icon not appearing** | Click the puzzle piece icon in Chrome toolbar → pin Sahayak. |
| **Content script not injecting** | The extension cannot run on Chrome internal pages (`chrome://`, `chrome-extension://`). Navigate to a normal website. |

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
