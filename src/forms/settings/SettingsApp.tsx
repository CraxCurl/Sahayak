import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Key, User, Sliders, MessageSquare, Settings as SettingsIcon } from 'lucide-react';
import { ChatAssistant } from '@forms/assistant/ChatAssistant';

export const SettingsApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'settings'>('chat');
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [highContrast, setHighContrast] = useState(false);

  const handleSave = () => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set(
        { sahayak_ollama_url: ollamaUrl, sahayak_high_contrast: highContrast },
        () => {
          alert('Settings saved successfully!');
        }
      );
    } else {
      alert('Settings saved (local state mode)');
    }
  };

  return (
    <div className="w-full h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Nav Tabs */}
      <nav className="flex items-center border-b border-slate-800 bg-slate-900/80 px-2 pt-2">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-t border-x ${
            activeTab === 'chat'
              ? 'bg-slate-950 text-sky-400 border-slate-800 border-b-slate-950'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          AI Chat Assistant
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-t border-x ${
            activeTab === 'settings'
              ? 'bg-slate-950 text-sky-400 border-slate-800 border-b-slate-950'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <SettingsIcon className="w-3.5 h-3.5" />
          Settings
        </button>
      </nav>

      {/* Main Tab View */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' ? (
          <ChatAssistant embedded={true} />
        ) : (
          <div className="max-w-md mx-auto flex flex-col gap-6 p-4 overflow-y-auto">
            <header className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <Sliders className="w-6 h-6 text-sky-400" />
              <div>
                <h1 className="text-lg font-bold text-slate-100">Sahayak Settings</h1>
                <p className="text-xs text-slate-400">Configure local Ollama Gemma 3 and preferences</p>
              </div>
            </header>

            <div className="flex flex-col gap-4">
              <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <Key className="w-4 h-4 text-sky-400" />
                  Local Ollama Server Endpoint
                </div>
                <input
                  type="text"
                  placeholder="http://localhost:11434"
                  value={ollamaUrl}
                  onChange={e => setOllamaUrl(e.target.value)}
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
        )}
      </div>
    </div>
  );
};

const container = document.getElementById('sidepanel-root');
if (container) {
  const root = createRoot(container);
  root.render(<SettingsApp />);
}
