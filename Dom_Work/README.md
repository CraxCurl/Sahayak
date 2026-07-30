# Dom_Work — Developer 1: Extension Core & Shell

> **Scope**: *Manifest V3, Service Worker, Popup UI, Chrome APIs, Message Router*

Vanilla-JavaScript Chrome Extension (Manifest V3) implementing exactly the Developer 1 deliverables listed in `README.md`. The TypeScript equivalents live in `../src/extension/`.

---

## Files (5 deliverables only)

| File | Deliverable |
| :--- | :--- |
| `manifest.json` | **Manifest V3** — declares permissions, service worker, content script, popup action |
| `background.js` | **Service Worker** — event loop + Chrome API handlers (`onInstalled`, `onMessage`) |
| `popup.html` / `popup.css` / `popup.js` | **Popup UI** — Extract button, stats, chips, AI send |
| `message-router.js` | **Message Router** — typed Promise wrapper around `chrome.runtime.sendMessage` / `chrome.tabs.sendMessage` |
| `content.js` | minimal helper required by the Message Router pipeline (responds to `EXTRACT_DOM` so the popup has something to display) |

---

## IPC contract (via MessageRouter)

| Type | Direction | Purpose |
| :--- | :--- | :--- |
| `PING_BACKGROUND` | popup → background | Liveness check (status dot) |
| `EXTRACT_DOM` | popup → background → content | Trigger DOM extraction on the active tab |
| `DOM_EXTRACTED` | popup → background | Forward extracted payload to AI module |

---

## Pipeline

```text
Popup (popup.js)
  └─ MessageRouter.extractActiveTab()
        └─ chrome.tabs.sendMessage(EXTRACT_DOM)
              └─ content.js → returns { title, headings, buttons, inputs, forms, text }
  └─ MessageRouter.forwardToAI(payload)
        └─ background.js handleExtractedPayload()
              └─ fetch http://localhost:11434/api/generate (Gemma 3)
              └─ returns SahayakActionManifest JSON
```

---

## Loading the extension

1. `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked** → select the `Dom_Work/` folder
4. Open any page → click the Sahayak icon → **Extract Page Data** → **Send to AI Module**

---

## Example extracted payload

```json
{
  "url": "https://scholarships.gov.in/apply",
  "title": "Scholarship Application",
  "headings": ["Apply for National Scholarship", "Personal Details"],
  "buttons": ["Submit", "Upload Documents"],
  "inputs":  ["Name", "DOB", "Aadhaar"],
  "forms":   [{ "id": "mainForm", "action": "/submit", "method": "POST", "fieldCount": 12 }],
  "text": "Scholarship application for..."
}
```