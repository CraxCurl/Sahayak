/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OLLAMA_URL?: string;
  readonly VITE_OLLAMA_MODEL?: string;
  readonly VITE_ENABLE_MOCK_AI?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
