# Sahayak - AI-Powered Offline Chrome Extension

**Sahayak** is an offline AI Google Chrome Extension designed for web accessibility, UI contrast adaptations, and Google Form field assistance powered by local Gemma models.

---

## Key Features

1. **Web UI & Accessibility Adaptations**:
   - High Contrast Mode (Deep background, high visibility contrast typography)
   - Dyslexia-Friendly Typography (`OpenDyslexic` font style and spacing)
   - Dynamic Font Scaler (100% to 150%)
   - Remove Clutter (Hides annoying ads, sticky banners, and distracting elements)
   - Focus Reader Mode (Dims non-essential sections to highlight the main content)

2. **Form Assistant with Interactive `ℹ️` Badges**:
   - Scans HTML forms & **Google Forms** automatically.
   - Places a glowing `ℹ️` info badge next to every input field.
   - On Click:
     - **AI Field Explanation**: Explains what input is expected in plain language.
     - **AI Auto-Fill**: Fills the field automatically using your saved personal vault profile with synthetic event triggering.

3. **Offline Gemma 4B Model Integration**:
   - Runs 100% locally with zero latency and full privacy.
   - Multi-provider architecture: Local Ollama Gemma API (`http://localhost:11434`), Chrome Built-in AI / Prompt API (`window.ai`), and fallback Heuristic Rule Engine.

---

## How to Build & Install in Google Chrome

### 1. Build the Extension
```bash
npm install
npm run build
```
This compiles all TypeScript scripts and bundles everything into the `dist/` directory.

### 2. Load into Chrome
1. Open Google Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** in the top right corner.
3. Click **Load unpacked**.
4. Select the `dist` folder located inside `C:\SAHAYAK WORK\dist`.

---

## Project Structure

```
C:\SAHAYAK WORK\
├── manifest.json            # Manifest V3 Extension Config
├── package.json             # NPM dependencies & scripts
├── vite.config.ts           # Vite build pipeline
├── src/
│   ├── ai/
│   │   ├── gemma-provider.ts # Offline Gemma 4B & fallback provider
│   │   └── prompts.ts        # Form explanation & auto-fill prompts
│   ├── background/
│   │   └── service-worker.ts # Service worker background script
│   ├── content/
│   │   ├── form-assistant.ts # Google Form & HTML form ℹ️ badge injector
│   │   ├── page-enhancer.ts  # Webpage UI/CSS accessibility modifier
│   │   ├── index.ts          # Content script entry point
│   │   └── content.css       # Popover & ℹ️ badge styling
│   ├── sidepanel/
│   │   ├── SidePanel.tsx     # Sahayak Control Center UI
│   │   └── sidepanel.css     # Glassmorphic Tailwind styles
│   └── types/
│       └── index.ts          # TypeScript type definitions
```
