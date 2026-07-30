export const SAHAYAK_CONSTANTS = {
  EXTENSION_NAME: 'Sahayak AI Web Adapter',
  VERSION: '1.0.0',
  STORAGE_KEYS: {
    USER_PREFERENCES: 'sahayak_user_preferences',
    OLLAMA_URL: 'sahayak_ollama_url',
    ACTION_CACHE: 'sahayak_action_cache',
  },
  DEFAULT_OLLAMA_MODEL: 'gemma3:4b',
  MAX_PAGE_SUMMARY_LENGTH: 4000,
} as const;
