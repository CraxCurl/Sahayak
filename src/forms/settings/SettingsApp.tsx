import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Key, User, MessageSquare, Settings as SettingsIcon, Shield, Zap, Globe, Save, Sparkles, RefreshCw } from 'lucide-react';
import { ChatAssistant } from '@forms/assistant/ChatAssistant';
import { MessageRouter } from '@extension/messaging/message-router';
import '../../../assets/styles/global.css';

export const SettingsApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'settings'>('chat');
  const [ollamaUrl, setOllamaUrl] = useState(import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434');
  const [highContrast, setHighContrast] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isAdapting, setIsAdapting] = useState(false);
  const [lastAdaptation, setLastAdaptation] = useState<string | null>(null);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get(['sahayak_ollama_url', 'sahayak_high_contrast'], (result) => {
        if (result.sahayak_ollama_url) {
          setOllamaUrl(result.sahayak_ollama_url);
        }
        if (result.sahayak_high_contrast !== undefined) {
          setHighContrast(result.sahayak_high_contrast);
        }
      });
    }
  }, []);

  const handleFullAdaptation = async () => {
    setIsAdapting(true);
    setLastAdaptation(null);
    try {
      const extractRes = (await MessageRouter.extractActiveTab()) as any;
      if (extractRes && extractRes.success && extractRes.payload) {
        const response = (await MessageRouter.forwardToAI(extractRes.payload, {
          adaptLayout: true,
          highlightButtons: true,
          simplifyText: true,
        })) as any;

        if (response && response.success) {
          setLastAdaptation(response.manifest?.summary || 'Webpage adapted successfully!');
        } else {
          throw new Error(response?.error || 'AI failed to generate adaptations.');
        }
      } else {
        throw new Error('Could not find a webpage to adapt. Make sure you have a site open in another tab.');
      }
    } catch (err: any) {
      alert(`Adaptation Error: ${err.message}`);
    } finally {
      setIsAdapting(false);
    }
  };

  const handleSave = () => {
    setStatus('saving');
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set(
        { sahayak_ollama_url: ollamaUrl, sahayak_high_contrast: highContrast },
        () => {
          setTimeout(() => {
            setStatus('saved');
            setTimeout(() => setStatus('idle'), 2000);
          }, 500);
        }
      );
    } else {
      setTimeout(() => setStatus('saved'), 500);
    }
  };

  return (
    <div className="w-full h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500/30">
      {/* Sidebar-style Navigation */}
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-slate-900/50 border-r border-slate-800 flex flex-col p-6 gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-800 shadow-lg">
              <img
                src="/assets/icons/logo.jpeg"
                alt="Sahayak Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">Sahayak</h1>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Dashboard</p>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'chat'
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              AI Assistant
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'settings'
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              Settings
            </button>
          </nav>

          <div className="mt-auto p-4 rounded-2xl bg-slate-950/50 border border-slate-800/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Local Node Active</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Running Gemma 3 via local Ollama instance for 100% privacy.
            </p>
          </div>

          <div className="flex flex-col gap-3 mt-4">
             <button
              onClick={handleFullAdaptation}
              disabled={isAdapting}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isAdapting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              )}
              {isAdapting ? 'Analyzing Webpage...' : 'Smart Adapt Active Tab'}
            </button>
            {lastAdaptation && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl animate-in fade-in zoom-in duration-300">
                <p className="text-[10px] text-emerald-400 font-medium leading-tight text-center">
                  {lastAdaptation}
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-8">
          <div className="max-w-3xl mx-auto">
            {activeTab === 'chat' ? (
              <div className="h-[calc(100vh-4rem)] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
                <ChatAssistant embedded={true} />
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-100 tracking-tight">System Settings</h2>
                  <p className="text-slate-400 mt-2">
                    Manage your AI connection, accessibility preferences, and extension behavior.
                  </p>
                </header>

                <div className="grid gap-6">
                  {/* Ollama Connection Section */}
                  <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 hover:border-slate-700/50 transition-colors">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400">
                          <Globe className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-100">AI Engine Connectivity</h3>
                          <p className="text-xs text-slate-500">Configure how Sahayak communicates with Ollama.</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                          Ollama Server Endpoint
                        </label>
                        <div className="relative group">
                          <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                          <input
                            type="text"
                            placeholder="http://localhost:11434"
                            value={ollamaUrl}
                            onChange={e => setOllamaUrl(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/5 transition-all"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 ml-1">
                          Default is <code className="text-sky-500/80 font-mono">http://localhost:11434</code>. Ensure Ollama is running before saving.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Privacy & Accessibility Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 hover:border-slate-700/50 transition-colors">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-100">Accessibility</h3>
                          <p className="text-xs text-slate-500">Visual comfort settings.</p>
                        </div>
                      </div>

                      <label className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/30 transition-colors cursor-pointer group">
                        <span className="text-sm font-medium text-slate-300 group-hover:text-slate-100 transition-colors">High Contrast Mode</span>
                        <div className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={highContrast}
                            onChange={e => setHighContrast(e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500 peer-checked:after:bg-white"></div>
                        </div>
                      </label>
                    </section>

                    <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 hover:border-slate-700/50 transition-colors">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                          <Shield className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-100">Privacy</h3>
                          <p className="text-xs text-slate-500">Data safety status.</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                        <Zap className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-semibold text-emerald-400">Local Processing Only</span>
                      </div>
                    </section>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-slate-800">
                    <button
                      onClick={handleSave}
                      disabled={status === 'saving'}
                      className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-xl active:scale-[0.98] ${
                        status === 'saved'
                          ? 'bg-emerald-600 text-white shadow-emerald-900/20'
                          : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-900/20'
                      } disabled:opacity-50`}
                    >
                      {status === 'saving' ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : status === 'saved' ? (
                        <Shield className="w-4 h-4" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {status === 'saving' ? 'Applying...' : status === 'saved' ? 'Settings Applied!' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

const container = document.getElementById('sidepanel-root');
if (container) {
  const root = createRoot(container);
  root.render(<SettingsApp />);
}
