import { create } from 'zustand';

export interface UserPreferences {
  enableHighContrast: boolean;
  enableTextSimplification: boolean;
  enableFormAutofill: boolean;
  fontSizeScale: number;
  ollamaUrl: string;
  ollamaModel: string;
}

interface PreferencesState {
  preferences: UserPreferences;
  updatePreferences: (partial: Partial<UserPreferences>) => void;
}

export const useUserPreferencesStore = create<PreferencesState>(set => ({
  preferences: {
    enableHighContrast: false,
    enableTextSimplification: true,
    enableFormAutofill: true,
    fontSizeScale: 1.0,
    ollamaUrl: import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434',
    ollamaModel: import.meta.env.VITE_OLLAMA_MODEL || 'gemma3:4b',
  },
  updatePreferences: partial =>
    set(state => ({
      preferences: { ...state.preferences, ...partial },
    })),
}));
