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
    ollamaUrl: 'http://localhost:11434',
    ollamaModel: 'gemma3:4b',
  },
  updatePreferences: partial =>
    set(state => ({
      preferences: { ...state.preferences, ...partial },
    })),
}));
