import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Sparkles,
  Settings,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileText,
  Terminal,
  Layers,
  Type,
  ToggleLeft,
  ToggleRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  Globe,
  Database,
  ArrowRight,
} from 'lucide-react';
import { MessageRouter } from '../messaging/message-router';
import { ChromeStorageService } from '../storage/chrome-storage';
import { ExtractedPageData } from '@shared/types/messages';
import '../../../assets/styles/global.css';

export const PopupApp: React.FC = () => {
  const [isActive, setIsActive] = useState(true);
  const [liveness, setLiveness] = useState<'pinging' | 'connected' | 'error'>('pinging');
  const [extractedData, setExtractedData] = useState<ExtractedPageData | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<{ summary: string; actionsCount: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Accordion toggle states for inspection panels
  const [showHeadings, setShowHeadings] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [showInputs, setShowInputs] = useState(false);

  useEffect(() => {
    // 1. Check liveness of background worker
    MessageRouter.ping()
      .then((res: unknown) => {
        const pingRes = res as { status?: string } | undefined;
        if (pingRes?.status === 'pong') {
          setLiveness('connected');
        } else {
          setLiveness('error');
        }
      })
      .catch(() => setLiveness('error'));

    // 2. Load enabled/disabled state from chrome storage
    ChromeStorageService.get<boolean>('sahayak_active', true).then(val => {
      setIsActive(val);
    });
  }, []);

  const handleToggleActive = async () => {
    const nextState = !isActive;
    setIsActive(nextState);
    await ChromeStorageService.set<boolean>('sahayak_active', nextState);

    // Notify active tab of setting changes if needed
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'SETTINGS_UPDATE',
          payload: { theme: 'dark', gemmaApiKey: '' }, // placeholder parameters to match message contract
        });
      }
    } catch (e) {
      console.warn('Could not propagate setting update to tab:', e);
    }
  };

  const handleExtractData = async () => {
    setIsExtracting(true);
    setErrorMessage(null);
    setAiResult(null);

    try {
      // Don't try to analyze extension internal pages
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.url?.startsWith('chrome-extension://') || tab?.url?.startsWith('chrome://')) {
        throw new Error('Sahayak cannot analyze extension or system pages. Open a regular website and try again.');
      }

      const response = (await MessageRouter.extractActiveTab()) as
        { success: boolean; payload?: ExtractedPageData; error?: string } | undefined;
      if (response && response.success && response.payload) {
        setExtractedData(response.payload);
      } else {
        setErrorMessage(
          response?.error || 'Extraction returned no payload. Is the content script active?'
        );
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to communicate with the page.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSendToAI = async () => {
    if (!extractedData) return;
    setIsAnalyzing(true);
    setErrorMessage(null);
    setAiResult(null);

    try {
      const response = (await MessageRouter.forwardToAI(extractedData, {
        adaptLayout: true,
        highlightButtons: true,
      })) as
        | { success: boolean; manifest?: { summary?: string; actions?: unknown[] }; error?: string }
        | undefined;

      if (response && response.success && response.manifest) {
        setAiResult({
          summary: response.manifest.summary || 'Webpage adapted successfully.',
          actionsCount: response.manifest.actions?.length || 0,
        });
      } else {
        setErrorMessage(response?.error || 'Ollama model returned an invalid response.');
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage('Error executing AI analysis. Ensure Ollama is running at localhost:11434.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 min-h-[480px] bg-slate-950 text-slate-100 select-none">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center bg-slate-900">
            <img
              src="/assets/icons/logo small.jpeg"
              alt="Sahayak Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="font-bold text-base bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
              Sahayak
            </h1>
            <span className="text-[10px] text-slate-400 font-mono">v1.0.0 (Local Gemma)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Liveness dot */}
          <span
            className={`w-2.5 h-2.5 rounded-full border border-black/30 shadow-sm ${
              liveness === 'connected'
                ? 'bg-emerald-500 animate-ping shadow-emerald-500/30'
                : liveness === 'pinging'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
            }`}
            title={`Status: ${liveness}`}
          />
          <button
            onClick={() => chrome.runtime.openOptionsPage?.()}
            className="p-1.5 rounded-lg hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 transition-all border border-slate-800/0 hover:border-slate-800"
            title="Configure settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col gap-4 flex-1">
        {/* Toggle Pause / Active */}
        <div className="flex items-center justify-between bg-slate-900/60 backdrop-blur-md p-3.5 rounded-xl border border-slate-800/80 hover:border-slate-700/50 transition-all">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-200">
              {isActive ? 'Sahayak Enabled' : 'Sahayak Paused'}
            </span>
            <span className="text-[10px] text-slate-400">
              {isActive ? 'Auto-adapting new pages' : 'Resume to adapt layouts'}
            </span>
          </div>
          <button
            onClick={handleToggleActive}
            className="text-slate-400 hover:text-sky-400 transition-colors"
          >
            {isActive ? (
              <ToggleRight className="w-9 h-9 text-sky-400" />
            ) : (
              <ToggleLeft className="w-9 h-9 text-slate-500" />
            )}
          </button>
        </div>

        {/* Primary Extract CTA */}
        <button
          onClick={handleExtractData}
          disabled={isExtracting || !isActive}
          className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl border transition-all text-xs font-semibold ${
            isActive
              ? 'bg-slate-900 hover:bg-slate-850 text-slate-200 hover:text-white border-slate-850 hover:border-slate-750 active:scale-[0.98]'
              : 'bg-slate-900/30 text-slate-650 border-slate-800/30 cursor-not-allowed'
          }`}
        >
          {isExtracting ? (
            <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
          )}
          {extractedData ? 'Refresh Extracted Data' : 'Extract Webpage Information'}
        </button>

        {/* Alert Messages */}
        {errorMessage && (
          <div className="flex gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs leading-relaxed animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>{errorMessage}</div>
          </div>
        )}

        {/* Extraction Results */}
        {extractedData && (
          <div className="flex flex-col gap-3.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
                <span className="text-lg font-bold text-sky-400 font-mono">
                  {extractedData.buttons.length}
                </span>
                <span className="text-[10px] text-slate-400">Buttons</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
                <span className="text-lg font-bold text-sky-400 font-mono">
                  {extractedData.inputs.length}
                </span>
                <span className="text-[10px] text-slate-400">Inputs</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
                <span className="text-lg font-bold text-sky-400 font-mono">
                  {extractedData.forms.length}
                </span>
                <span className="text-[10px] text-slate-400">Forms</span>
              </div>
            </div>

            {/* Document Title Panel */}
            <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-900/20 border border-slate-800/60">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-semibold truncate max-w-[280px]" title={extractedData.url}>
                  {extractedData.url}
                </span>
              </div>
              <div className="text-sm font-semibold text-slate-200 leading-tight">
                {extractedData.title || '(No Page Title)'}
              </div>
            </div>

            {/* Inspector Details */}
            <div className="flex flex-col gap-2">
              {/* Headings */}
              <div className="rounded-xl border border-slate-800/60 overflow-hidden bg-slate-900/10">
                <button
                  onClick={() => setShowHeadings(!showHeadings)}
                  className="flex items-center justify-between w-full px-3.5 py-2.5 hover:bg-slate-900/40 transition-colors text-xs font-semibold text-slate-300"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-sky-400" />
                    <span>Headings</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono">
                      {extractedData.headings.length}
                    </span>
                  </div>
                  {showHeadings ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {showHeadings && (
                  <div className="px-3.5 pb-3 pt-1 border-t border-slate-850/80 flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                    {extractedData.headings.length === 0 ? (
                      <span className="text-[11px] text-slate-500 italic">No headings found</span>
                    ) : (
                      extractedData.headings.map((h, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded bg-slate-900 border border-slate-800/80 text-[10px] text-slate-300 font-medium truncate max-w-[280px]"
                          title={h}
                        >
                          {h}
                        </span>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="rounded-xl border border-slate-800/60 overflow-hidden bg-slate-900/10">
                <button
                  onClick={() => setShowButtons(!showButtons)}
                  className="flex items-center justify-between w-full px-3.5 py-2.5 hover:bg-slate-900/40 transition-colors text-xs font-semibold text-slate-300"
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-sky-400" />
                    <span>Button Elements</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono">
                      {extractedData.buttons.length}
                    </span>
                  </div>
                  {showButtons ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {showButtons && (
                  <div className="px-3.5 pb-3 pt-1 border-t border-slate-850/80 flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                    {extractedData.buttons.length === 0 ? (
                      <span className="text-[11px] text-slate-500 italic">No buttons found</span>
                    ) : (
                      extractedData.buttons.map((b, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded bg-slate-900 border border-slate-800/80 text-[10px] text-slate-300 font-medium truncate max-w-[280px]"
                          title={b}
                        >
                          {b}
                        </span>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Inputs */}
              <div className="rounded-xl border border-slate-800/60 overflow-hidden bg-slate-900/10">
                <button
                  onClick={() => setShowInputs(!showInputs)}
                  className="flex items-center justify-between w-full px-3.5 py-2.5 hover:bg-slate-900/40 transition-colors text-xs font-semibold text-slate-300"
                >
                  <div className="flex items-center gap-2">
                    <Type className="w-3.5 h-3.5 text-sky-400" />
                    <span>Inputs & Fields</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono">
                      {extractedData.inputs.length}
                    </span>
                  </div>
                  {showInputs ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {showInputs && (
                  <div className="px-3.5 pb-3 pt-1 border-t border-slate-850/80 flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                    {extractedData.inputs.length === 0 ? (
                      <span className="text-[11px] text-slate-500 italic">No inputs found</span>
                    ) : (
                      extractedData.inputs.map((inpt, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded bg-slate-900 border border-slate-800/80 text-[10px] text-slate-300 font-medium truncate max-w-[280px]"
                          title={inpt}
                        >
                          {inpt}
                        </span>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Forms List (only if exists) */}
              {extractedData.forms.length > 0 && (
                <div className="flex flex-col gap-1.5 p-3 rounded-xl border border-slate-800/60 bg-slate-900/10">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <Database className="w-3.5 h-3.5 text-sky-400" />
                    <span>Detected Forms</span>
                  </div>
                  <div className="flex flex-col gap-2 max-h-24 overflow-y-auto mt-1 border-t border-slate-850/80 pt-1.5">
                    {extractedData.forms.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-[10px] text-slate-400 font-mono"
                      >
                        <span
                          className="truncate max-w-[150px]"
                          title={f.id || f.name || `Form ${i + 1}`}
                        >
                          {f.id || f.name || `Form ${i + 1}`}
                        </span>
                        <div className="flex items-center gap-2 font-sans font-medium text-slate-300">
                          <span className="px-1 py-0.5 rounded bg-slate-800 text-[9px] font-semibold text-sky-400">
                            {f.method}
                          </span>
                          <span>{f.fieldCount} fields</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Visible Text Extract */}
              <div className="flex flex-col gap-1.5 p-3.5 rounded-xl border border-slate-800/60 bg-slate-900/10">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <Terminal className="w-3.5 h-3.5 text-sky-400" />
                  <span>Visible Text Extract</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 leading-relaxed max-h-24 overflow-y-auto border-t border-slate-850/80 pt-2 pr-1 select-text">
                  {extractedData.text || 'No text extracted.'}
                </div>
              </div>
            </div>

            {/* Gemma Trigger Button */}
            <button
              onClick={handleSendToAI}
              disabled={isAnalyzing}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-sky-500/15 hover:shadow-sky-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Gemma is analyzing page...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                  <span>Send to AI Module</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Gemma Adaptation Success Manifest */}
        {aiResult && (
          <div className="flex gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs leading-relaxed animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-200 mb-0.5">Adaptations Applied!</div>
              <div>{aiResult.summary}</div>
              <div className="mt-1 text-[10px] text-emerald-400 font-mono">
                Executed {aiResult.actionsCount} adapt actions on page.
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center text-[9px] text-slate-600 pt-3 border-t border-slate-900/60 mt-auto">
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
