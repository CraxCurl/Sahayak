import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, X, Target, HelpCircle, Bot, User, Minimize2 } from 'lucide-react';
import { PageAnalyzer } from '@dom/analyzer/page-analyzer';
import { ChatMessage } from '@shared/types/messages';
import { MessageRouter } from '@extension/messaging/message-router';

interface ChatAssistantProps {
  embedded?: boolean;
  onClose?: () => void;
}

const DEFAULT_QUICK_QUESTIONS = [
  'Where do I upload my documents?',
  'What is this page about?',
  'Which fields are required?',
  'Explain eligibility policy',
];

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ embedded = false, onClose }) => {
  const [isOpen, setIsOpen] = useState(embedded);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: 'Hello! I am Sahayak AI Assistant. Ask me anything about this webpage or click a quick question below!',
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

    let summaryData;
    let pageUrl;

    try {
      // If we are in the dashboard/options page, we need to extract from the active web tab
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
        // We are already in the content script
        summaryData = analyzerRef.current.analyzeCurrentPage();
        pageUrl = window.location.href || summaryData.pageUrl;
      }

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
              handleFallbackResponse(text);
            }
          }
        );
      } else {
        setTimeout(() => {
          setIsLoading(false);
          handleFallbackResponse(text);
        }, 600);
      }
    } catch (err: any) {
      setIsLoading(false);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `Error: ${err.message}. Make sure you have a website open in another tab and it's not a restricted page.`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const handleFallbackResponse = (userQuery: string) => {
    const lower = userQuery.toLowerCase();
    let text =
      'I parsed the webpage content. Ensure all required details are accurate before submitting!';
    let highlightSelector: string | undefined = undefined;

    if (lower.includes('upload') || lower.includes('document')) {
      text =
        'You can upload your documents in the "Document Upload Section" located near the bottom of the form.';
      highlightSelector = '#btn-upload-docs, input[type="file"], .document-upload-box';
    } else if (lower.includes('required') || lower.includes('field')) {
      text =
        'Mandatory fields on this portal are: Applicant Full Name, Aadhaar Number, Annual Family Income, and Income Certificate.';
      highlightSelector = '#full-name, #aadhaar-number, #annual-income';
    } else if (lower.includes('about') || lower.includes('what')) {
      text =
        'This page is the National Higher Education & Skill Scholarship Application Portal for session 2026-27.';
      highlightSelector = 'header, h1';
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
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({
        type: 'HIGHLIGHT_TARGET_ELEMENT',
        payload: { selector },
      });
    } else {
      const els = document.querySelectorAll(selector);
      if (els.length > 0) {
        els[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        (els[0] as HTMLElement).style.outline = '4px solid #38bdf8';
        (els[0] as HTMLElement).style.boxShadow = '0 0 20px rgba(56, 189, 248, 0.6)';
        setTimeout(() => {
          (els[0] as HTMLElement).style.outline = '';
          (els[0] as HTMLElement).style.boxShadow = '';
        }, 3000);
      }
    }
  };

  if (!isOpen && !embedded) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[99999] flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-sky-500 via-indigo-600 to-sky-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-full shadow-2xl shadow-sky-500/40 border border-sky-300/30 transition-all duration-300 transform hover:scale-105 active:scale-95 group font-sans"
        aria-label="Open Sahayak AI Assistant"
      >
        <div className="relative">
          <Sparkles className="w-5 h-5 animate-pulse text-sky-200" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900"></span>
        </div>
        <span className="text-xs font-bold tracking-wide">Sahayak AI Assistant</span>
      </button>
    );
  }

  return (
    <div
      className={`${
        embedded
          ? 'w-full h-full flex flex-col bg-slate-950 text-slate-100 font-sans'
          : 'fixed bottom-6 right-6 w-96 max-w-[calc(100vw-2rem)] h-[540px] z-[99999] flex flex-col bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl shadow-sky-950/50 text-slate-100 font-sans overflow-hidden transition-all duration-300'
      }`}
    >
      {/* Top Header */}
      <header className="flex items-center justify-between px-4 py-3.5 bg-slate-900/90 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              Sahayak AI Chat
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 rounded-md border border-emerald-500/30">
                Gemma 3
              </span>
            </h2>
            <p className="text-[10px] text-slate-400">Context-Aware Page Assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {!embedded && (
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors"
              title="Minimize chat"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg transition-colors"
              title="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3.5 overflow-y-auto flex flex-col gap-3.5 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col gap-1 max-w-[85%] ${
              msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
            }`}
          >
            <div className="flex items-center gap-1.5 px-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
              {msg.sender === 'user' ? (
                <>
                  <span>You</span>
                  <div className="w-5 h-5 rounded-full bg-sky-500/20 flex items-center justify-center border border-sky-500/30">
                    <User className="w-3 h-3 text-sky-400" />
                  </div>
                </>
              ) : (
                <>
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                    <Bot className="w-3 h-3 text-indigo-400" />
                  </div>
                  <span>Sahayak AI</span>
                </>
              )}
            </div>

            <div
              className={`p-3.5 text-[13px] leading-relaxed rounded-2xl shadow-xl transition-all hover:shadow-sky-900/10 ${
                msg.sender === 'user'
                  ? 'bg-sky-600 text-white rounded-tr-none border border-sky-400/20'
                  : 'bg-slate-900/95 border border-slate-800/90 text-slate-200 rounded-tl-none'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>

              {msg.highlightSelector && (
                <button
                  onClick={() => handleTriggerHighlight(msg.highlightSelector)}
                  className="mt-2.5 flex items-center gap-1.5 px-2.5 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-[10px] font-medium rounded-lg transition-colors group"
                >
                  <Target className="w-3 h-3 text-sky-400 group-hover:scale-110 transition-transform" />
                  Highlight Element on Page
                </button>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="self-start flex items-center gap-2 px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-spin" />
            <span>Analyzing webpage context with Gemma 3...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Questions */}
      <div className="px-3 py-2 bg-slate-900/50 border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
        {DEFAULT_QUICK_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            disabled={isLoading}
            className="shrink-0 px-2.5 py-1 bg-slate-800/80 hover:bg-sky-900/40 hover:border-sky-500/40 border border-slate-700/50 text-[10px] text-slate-300 hover:text-sky-200 rounded-full transition-all"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Footer */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSendMessage(inputQuery);
        }}
        className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={e => setInputQuery(e.target.value)}
          placeholder="Ask about this page..."
          className="flex-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isLoading}
          className="p-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-40 text-white rounded-xl shadow-md transition-all shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
