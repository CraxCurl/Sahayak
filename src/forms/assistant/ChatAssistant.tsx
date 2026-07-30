import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, X, Target, HelpCircle, Minimize2, Copy, Check, RefreshCw } from 'lucide-react';
import { PageAnalyzer } from '@dom/analyzer/page-analyzer';
import { ChatMessage } from '@shared/types/messages';
import { MessageRouter } from '@extension/messaging/message-router';

interface ChatAssistantProps {
  embedded?: boolean;
  onClose?: () => void;
}

const DEFAULT_QUICK_QUESTIONS = [
  'Summarize this page',
  'Where do I upload files?',
  'What are the key required fields?',
  'Explain eligibility policy',
];

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ embedded = false, onClose }) => {
  const [isOpen, setIsOpen] = useState(embedded);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<'reading' | 'analyzing' | 'generating'>('reading');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: 'Hello! I am **Sahayak AI** powered by local Gemma 3. Ask me anything about this webpage or select a prompt below to get started.',
      timestamp: Date.now(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const analyzerRef = useRef(new PageAnalyzer());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendMessage = async (queryText: string) => {
    const text = queryText.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);
    setLoadingStage('reading');

    let summaryData: any = undefined;
    let pageUrl: string = '';

    try {
      setTimeout(() => setLoadingStage('analyzing'), 500);

      // If we are in the dashboard/options page, extract from the active web tab
      if (window.location.protocol.startsWith('chrome-extension')) {
        const response = (await MessageRouter.extractActiveTab()) as
          { success: boolean; payload?: any; error?: string } | undefined;
        if (response && response.success && response.payload) {
          summaryData = response.payload;
          pageUrl = summaryData.url;
        } else {
          throw new Error(response?.error || 'Could not reach the active webpage.');
        }
      } else {
        // Content script context
        summaryData = analyzerRef.current.analyzeCurrentPage();
        pageUrl = window.location.href || summaryData.pageUrl;
      }

      setLoadingStage('generating');

      if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        chrome.runtime.sendMessage(
          {
            type: 'CHAT_QUERY_REQUEST',
            payload: {
              question: text,
              pageUrl,
              textSummary: summaryData.textSummary || summaryData.text,
            },
          },
          response => {
            setIsLoading(false);
            if (response && response.success) {
              const aiMsg: ChatMessage = {
                id: `ai-${Date.now()}`,
                sender: 'assistant',
                text: response.answer,
                timestamp: Date.now(),
                highlightSelector: response.highlightSelector,
              };
              setMessages(prev => [...prev, aiMsg]);
            } else {
              handleFallbackResponse(text, summaryData);
            }
          }
        );
      } else {
        setTimeout(() => {
          setIsLoading(false);
          handleFallbackResponse(text, summaryData);
        }, 600);
      }
    } catch (err: any) {
      setIsLoading(false);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `Error: ${err.message}. Make sure you have an active website open in another tab.`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const handleFallbackResponse = (userQuery: string, summaryData?: any) => {
    const lower = userQuery.toLowerCase();
    const currentSummary = summaryData || analyzerRef.current.analyzeCurrentPage();
    const pageTitle = currentSummary?.title || document.title || 'Current Webpage';
    const headings = currentSummary?.headings || [];
    const textExtract = currentSummary?.textSummary || currentSummary?.text || '';

    let text = `Context summary for **${pageTitle}**:\n\nKey details parsed successfully from current page structure.`;
    let highlightSelector: string | undefined = undefined;

    if (lower.includes('upload') || lower.includes('document') || lower.includes('file')) {
      const fileInputs = document.querySelectorAll('input[type="file"], #btn-upload-docs, .document-upload-box');
      if (fileInputs.length > 0) {
        text = `Found document upload options on **${pageTitle}**. Click the highlight button below to navigate directly to them.`;
        highlightSelector = '#btn-upload-docs, input[type="file"], .document-upload-box';
      } else {
        text = `Checked **${pageTitle}** for file attachments. Upload controls usually reside inside main application forms.`;
        highlightSelector = 'form, input';
      }
    } else if (lower.includes('required') || lower.includes('field') || lower.includes('input') || lower.includes('form')) {
      const reqInputs = Array.from(document.querySelectorAll('input[required], select[required], textarea[required]'));
      if (reqInputs.length > 0) {
        const fieldNames = reqInputs
          .map(el => el.getAttribute('placeholder') || el.id || el.getAttribute('name'))
          .filter(Boolean)
          .slice(0, 4);
        text = `Required fields detected on this page:\n• ${fieldNames.join('\n• ') || 'Mandatory form inputs'}`;
        highlightSelector = 'input[required], select[required], textarea[required], input';
      } else {
        text = `Scanned form fields on **${pageTitle}**. Ensure all mandatory inputs are properly completed.`;
        highlightSelector = 'input, select, textarea';
      }
    } else if (lower.includes('about') || lower.includes('what') || lower.includes('summary') || lower.includes('explain')) {
      const topHeadings = Array.isArray(headings) ? headings.slice(0, 3).join(' • ') : '';
      text = `### Overview: ${pageTitle}\n\n${topHeadings ? '**Key Sections:** ' + topHeadings + '\n\n' : ''}${textExtract.slice(0, 300)}...`;
      highlightSelector = 'h1, h2, header, main';
    } else {
      text = `Analyzed **${pageTitle}**:\n\n${textExtract.slice(0, 250)}...`;
      highlightSelector = 'h1, form, button';
    }

    const aiMsg: ChatMessage = {
      id: `ai-${Date.now()}`,
      sender: 'assistant',
      text,
      timestamp: Date.now(),
      highlightSelector,
    };
    setMessages(prev => [...prev, aiMsg]);
  };

  const handleTriggerHighlight = (selector?: string) => {
    if (!selector) return;

    const els = document.querySelectorAll(selector);
    if (els.length > 0) {
      const first = els[0] as HTMLElement;
      first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      els.forEach(el => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.transition = 'all 0.3s ease-in-out';
        htmlEl.style.outline = '4px solid #10a37f';
        htmlEl.style.outlineOffset = '3px';
        htmlEl.style.boxShadow = '0 0 25px rgba(16, 163, 127, 0.8)';
        setTimeout(() => {
          htmlEl.style.outline = '';
          htmlEl.style.boxShadow = '';
        }, 4000);
      });
    }

    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({
        type: 'HIGHLIGHT_TARGET_ELEMENT',
        payload: { selector },
      });
    }
  };

  if (!isOpen && !embedded) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[99999] flex items-center gap-2.5 px-4 py-3 bg-[#10a37f] hover:bg-[#1a7f64] text-white rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 font-sans"
        aria-label="Open ChatGPT Assistant"
      >
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-xs font-semibold tracking-wide">Sahayak AI</span>
      </button>
    );
  }

  return (
    <div
      className={`${
        embedded
          ? 'w-full h-full flex flex-col bg-[#202123] text-gray-100 font-sans'
          : 'fixed bottom-6 right-6 w-[420px] max-w-[calc(100vw-2rem)] h-[600px] z-[99999] flex flex-col bg-[#202123] border border-gray-700/60 rounded-2xl shadow-2xl text-gray-100 font-sans overflow-hidden transition-all duration-300'
      }`}
    >
      {/* ChatGPT-style Minimal Dark Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-[#343541] border-b border-gray-700/50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[#10a37f] flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-gray-100 flex items-center gap-2">
              Sahayak GPT
              <span className="px-1.5 py-0.2 text-[9px] font-mono font-medium bg-[#10a37f]/20 text-[#10a37f] rounded border border-[#10a37f]/30">
                Gemma 3
              </span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {!embedded && (
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-[#40414f] rounded-md transition-colors"
              title="Minimize"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-[#40414f] rounded-md transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-700/40 scrollbar-thin scrollbar-thumb-gray-600">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`p-4 flex gap-3 ${
              msg.sender === 'user' ? 'bg-[#343541]' : 'bg-[#444654]'
            }`}
          >
            {/* Avatar */}
            <div className="shrink-0">
              {msg.sender === 'user' ? (
                <div className="w-7 h-7 rounded-sm bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  U
                </div>
              ) : (
                <div className="w-7 h-7 rounded-sm bg-[#10a37f] flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Content & Actions */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-gray-300">
                  {msg.sender === 'user' ? 'You' : 'Sahayak AI'}
                </span>

                {msg.sender === 'assistant' && (
                  <button
                    onClick={() => handleCopyText(msg.id, msg.text)}
                    className="text-gray-400 hover:text-gray-200 p-1 rounded transition-colors"
                    title="Copy text"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3.5 h-3.5 text-[#10a37f]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>

              <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap font-sans">
                {msg.text}
              </div>

              {msg.highlightSelector && (
                <button
                  onClick={() => handleTriggerHighlight(msg.highlightSelector)}
                  className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-[#10a37f]/10 hover:bg-[#10a37f]/20 border border-[#10a37f]/40 text-[#10a37f] text-xs font-medium rounded-md transition-colors"
                >
                  <Target className="w-3.5 h-3.5" />
                  Locate & Highlight on Webpage
                </button>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="p-4 bg-[#444654] flex gap-3 items-center">
            <div className="w-7 h-7 rounded-sm bg-[#10a37f] flex items-center justify-center text-white shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#10a37f]" />
              <span>
                {loadingStage === 'reading' && 'Reading webpage context...'}
                {loadingStage === 'analyzing' && 'Analyzing DOM structure...'}
                {loadingStage === 'generating' && 'Thinking...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter Question Chips */}
      <div className="px-3 py-2 bg-[#202123] border-t border-gray-700/50 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <HelpCircle className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-1" />
        {DEFAULT_QUICK_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            disabled={isLoading}
            className="shrink-0 px-3 py-1 bg-[#343541] hover:bg-[#40414f] border border-gray-600/50 text-xs text-gray-300 hover:text-white rounded-full transition-all"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Bar - ChatGPT Style Floating Box */}
      <div className="p-3 bg-[#202123] border-t border-gray-700/50">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage(inputQuery);
          }}
          className="relative flex items-center bg-[#40414f] rounded-xl border border-gray-600/60 focus-within:border-[#10a37f] transition-all shadow-inner"
        >
          <textarea
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(inputQuery);
              }
            }}
            placeholder="Send a message..."
            rows={1}
            className="w-full bg-transparent px-4 py-3 text-sm text-gray-100 placeholder-gray-400 focus:outline-none resize-none no-scrollbar"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="absolute right-2 p-2 bg-[#10a37f] hover:bg-[#1a7f64] disabled:opacity-30 disabled:hover:bg-[#10a37f] text-white rounded-lg transition-all shadow"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        <p className="text-[10px] text-center text-gray-500 mt-1.5">
          Sahayak GPT runs locally via Gemma 3. Verification recommended for critical details.
        </p>
      </div>
    </div>
  );
};

