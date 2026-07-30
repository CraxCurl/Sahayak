import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Key, Shield, User, Sliders } from 'lucide-react';

export const SettingsApp: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [highContrast, setHighContrast] = useState(false);

  const handleSave = () => {
    chrome.storage.local.set({ sahayak_gemma_api_key: apiKey, sahayak_high_contrast: highContrast }, () => {
      alert('Settings saved successfully!');
    });
  };

  return (
    <div className="max-w-md mx-auto flex flex-col gap-6 p-4">
      <header className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <Sliders className="w-6 h-6 text-sky-400" />
        <div>
          <h1 className="text-lg font-bold text-slate-100">Sahayak Settings</h1>
          <p className="text-xs text-slate-400">Configure AI provider and user preferences</p>
        </div>
      </header>

      <div className="flex flex-col gap-4">
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Key className="w-4 h-4 text-sky-400" />
            Google Gemma API Configuration
          </div>
          <input
            type="password"
            placeholder="Enter Google Gemma API Key"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          />
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <User className="w-4 h-4 text-sky-400" />
            Accessibility & Preferences
          </div>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs text-slate-300">Force High Contrast Mode</span>
            <input
              type="checkbox"
              checked={highContrast}
              onChange={e => setHighContrast(e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-sky-500 focus:ring-0"
            />
          </label>
        </section>

        <button
          onClick={handleSave}
          className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-sky-600/20"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
};

const container = document.getElementById('sidepanel-root');
if (container) {
  const root = createRoot(container);
  root.render(<SettingsApp />);
}
