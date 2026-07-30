# 🖥️ Sahayak Presentation Slides Outline

---

### Slide 1: Cover
- **Title**: Sahayak - Local AI-Powered Web Adapter
- **Subtitle**: Redefining Web Accessibility with Google Gemma 3 & Ollama
- **Presenter**: Member 4 (AI Chat Assistant & Demo Systems Lead)

---

### Slide 2: The Core Challenge
- **Websites are rigid**: Users are forced to parse complex legal jargon, navigate confusing forms, and adjust to bad UI contrast.
- **Our Vision**: *The website adapts to the user — NOT the user to the website.*
- **Zero Cloud Dependence**: 100% private, local execution running Gemma 3 via Ollama.

---

### Slide 3: System Architecture Overview
- **Member 1**: Chrome Extension Shell & DOM Data Extraction
- **Member 2**: Gemma 3 Prompting & Zod Action Manifest Generator
- **Member 3**: Safe DOM Mutation & Dynamic CSS Injector
- **Member 4**: Interactive Context-Aware AI Chat & Live Element Highlighting

---

### Slide 4: Member 4 Feature Deep-Dive
- **Floating AI Chat Widget & Side Panel**:
  - Embedded seamlessly via Shadow DOM (zero style leaking).
  - Pre-populated quick question chips for instant page navigation.
  - Interactive element highlighting: When asked where a field or button is, Sahayak scrolls to and pulses the target DOM element.

---

### Slide 5: Live Demonstration
- Showcase on the **National Higher Education & Skill Scholarship Portal** (`demo-website/index.html`).
- Demo questions:
  1. *"Where do I upload my documents?"* → Highlights upload dropzone.
  2. *"Which fields are required?"* → Highlights mandatory form inputs.
  3. *"Explain eligibility policy"* → Simplifies legal disclaimers into plain English.

---

### Slide 6: Summary & Future Roadmap
- **Privacy First**: Zero API Keys, 100% Local Inference.
- **Roadmap**: Speech-to-Text Voice Mode, Dyslexia/ADHD Focus Presets, Multi-page form auto-fill.
- **Thank You & Q&A**.
