import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Sparkles, Settings, Eye, RefreshCw } from 'lucide-react';

export const PopupApp: React.FC = () => {
  const [isActive, setIsActive] = useState(true);
  const [status, setStatus] = useState<string>('Sahayak Active');

  const handleToggle = () => {
    setIsActive(!isActive);
    setStatus(!isActive ? 'Sahayak Active' : 'Sahayak Paused');
  };

  return (
    <div className="flex flex-col gap-4 p-2">
      <header className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base text-slate-100 leading-none">Sahayak</h1>
            <span className="text-[10px] text-slate-400 font-mono">v1.0.0 (Gemma AI)</span>
          </div>
        </div>
        <button
          onClick={() => chrome.runtime.openOptionsPage?.()}
          className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </header>

      <main className="flex flex-col gap-3">
        <div className="flex items-center justify-between bg-slate-850 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-sky-400" />
            <span className="text-sm font-medium text-slate-200">{status}</span>
          </div>
          <button
            onClick={handleToggle}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isActive
                ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/20'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
            }`}
          >
            {isActive ? 'Pause' : 'Enable'}
          </button>
        </div>

        <button
          onClick={() => {
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
              if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, {
                  type: 'DOM_ANALYZE_PAGE',
                  payload: { pageUrl: tabs[0].url || '' },
                });
              }
            });
          }}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
          Re-adapt Current Webpage
        </button>
      </main>

      <footer className="text-center text-[10px] text-slate-500 pt-2 border-t border-slate-900">
        AI-Powered Non-Invasive DOM Adaptations
      </footer>
    </div>
  );
};

const container = document.getElementById('popup-root');
if (container) {
  const root = createRoot(container);
  root.render(<PopupApp />);
}
