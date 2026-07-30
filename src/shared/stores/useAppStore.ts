import { create } from 'zustand';

interface AppState {
  isExtensionActive: boolean;
  isAnalyzing: boolean;
  activeTabUrl: string;
  setExtensionActive: (active: boolean) => void;
  setAnalyzing: (analyzing: boolean) => void;
  setActiveTabUrl: (url: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isExtensionActive: true,
  isAnalyzing: false,
  activeTabUrl: '',
  setExtensionActive: (active) => set({ isExtensionActive: active }),
  setAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
  setActiveTabUrl: (url) => set({ activeTabUrl: url }),
}));
