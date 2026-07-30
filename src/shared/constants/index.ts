export const SAHAYAK_CONSTANTS = {
  EXTENSION_NAME: 'Sahayak AI Web Adapter',
  VERSION: '1.0.0',
  STORAGE_KEYS: {
    USER_PREFERENCES: 'sahayak_user_preferences',
    GEMMA_API_KEY: 'sahayak_gemma_api_key',
    ACTION_CACHE: 'sahayak_action_cache',
  },
  GEMMA_DEFAULT_MODEL: 'gemma-7b-it',
  MAX_PAGE_SUMMARY_LENGTH: 4000,
} as const;
