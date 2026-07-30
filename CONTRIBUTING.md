# Contributing to Sahayak

Thank you for contributing to **Sahayak**! We welcome hackathon team members and open-source contributors.

---

## 🚀 Local AI Prerequisites (Ollama & Gemma 3)

Sahayak runs **100% locally** using Ollama. No cloud API keys are required.

1. **Install Ollama**:
   Download and install from [ollama.com](https://ollama.com/).

2. **Pull Gemma 3 Model**:
   ```bash
   ollama pull gemma3:4b
   ```

3. **Verify Ollama Server**:
   Ensure Ollama is running locally on port `11434`:
   ```bash
   curl http://localhost:11434/
   ```

---

## 👥 Module Ownership & Workflow Rules

Each developer owns a single module to eliminate merge conflicts:

- **Developer 1**: Extension Shell (`src/extension/`)
- **Developer 2**: DOM Engine & Accessibility (`src/dom/`)
- **Developer 3**: AI & Ollama Gemma 3 (`src/ai/`)
- **Developer 4**: Forms & User Settings (`src/forms/`)

### Rule Enforcement
- Feature modules **MUST NOT** import directly from each other.
- Use `@shared/types`, `@shared/stores`, or Chrome Runtime messages for cross-module features.
- Before opening a PR, always run:
  ```bash
  npm run typecheck
  npm run lint
  npm run format:check
  npm run build
  ```

---

## 📝 Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat(dom): add safe text simplifier`
- `feat(ai): integrate ollama gemma3 endpoint`
- `fix(extension): fix background service worker listener`
- `docs(memory): update project memory checklist`
