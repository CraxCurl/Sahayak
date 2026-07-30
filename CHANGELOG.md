# Changelog

All notable changes to **Sahayak** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-07-30 — Hackathon MVP Release 🚀

### Added
- **Local AI Integration**: Full Gemma 3 support running locally via Ollama (`http://localhost:11434`, model `gemma3:4b`).
- **Adaptive UI Engine**: AI-driven webpage analysis returning Zod-validated `SahayakActionManifest`.
- **Safe DOM Executor**: Memory-safe `WeakMap` DOM backups, ephemeral styling, non-destructive highlights, and text simplifications.
- **5 Simplification Modes**: Reader Mode, Focus Mode, Minimal Mode, Beginner Mode, and Accessibility Mode.
- **Accessibility Engine**: Dynamic font scaling, high contrast toggle, enhanced keyboard focus outlines, and `prefers-reduced-motion` override.
- **Shadow DOM Overlay**: Floating accessibility widget completely isolated from target website CSS.
- **Context-Aware AI Chat Assistant**: Sidepanel & floating chat assistant answering page-specific questions with element highlighting.
- **Intelligent Form Assistant**: Persona profile store in Chrome Storage for smart form prefilling.
- **Documentation Suite**: Comprehensive technical guides in `docs/` and synced `MEMORY.md`.
