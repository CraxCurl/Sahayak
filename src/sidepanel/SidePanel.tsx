import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  UserCheck, 
  Cpu, 
  Sliders, 
  Power,
  Save, 
  Plus, 
  Trash2, 
  CheckCircle2,
  AlertCircle,
  Wand2
} from 'lucide-react';
import { AccessibilitySettings, UserProfile, LLMConfig } from '../types/index';
import { GemmaOfflineProvider } from '../ai/gemma-provider';

export default function SidePanel() {
  const [activeTab, setActiveTab] = useState<'accessibility' | 'profile' | 'ai'>('accessibility');

  // Accessibility State
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>({
    enabled: true,
    highContrast: false,
    dyslexiaFont: false,
    fontScale: 100,
    removeClutter: true,
    simplifyLayout: false,
    lineSpacing: 1.2,
    readerMode: false
  });

  // Profile State
  const [profile, setProfile] = useState<UserProfile>({
    fullName: 'Dhruv Sharma',
    firstName: 'Dhruv',
    lastName: 'Sharma',
    email: 'dhruv@example.com',
    phone: '9876543210',
    address: '123 Innovation Way',
    city: 'New Delhi',
    state: 'Delhi',
    zipCode: '110001',
    country: 'India',
    organization: 'Sahayak AI Labs',
    jobTitle: 'Senior AI Engineer',
    bio: 'Software engineer building 8-bit web accessibility extensions.',
    customFields: {
      'Destination Station': 'NDLS - New Delhi',
      'Boarding Station': 'NDLS - New Delhi'
    }
  });

  // LLM Config State
  const [llmConfig, setLlmConfig] = useState<LLMConfig>({
    provider: 'ollama',
    ollamaEndpoint: 'http://localhost:11434',
    modelName: 'gemma2:2b',
    temperature: 0.2
  });

  const [bioInput, setBioInput] = useState<string>('');
  const [isParsingBio, setIsParsingBio] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'checking'>('offline');
  const [newCustomKey, setNewCustomKey] = useState<string>('');
  const [newCustomVal, setNewCustomVal] = useState<string>('');

  const gemmaProvider = new GemmaOfflineProvider(llmConfig);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get(['accessibility', 'profile', 'llmConfig'], (res) => {
        if (res.accessibility) {
          setAccessibility(res.accessibility);
        }
        if (res.profile) setProfile(res.profile);
        if (res.llmConfig) {
          setLlmConfig(res.llmConfig);
          gemmaProvider.updateConfig(res.llmConfig);
        }
      });
    }
    checkOllamaConnection();
  }, []);

  const checkOllamaConnection = async () => {
    setConnectionStatus('checking');
    try {
      const res = await fetch(`${llmConfig.ollamaEndpoint}/api/tags`);
      if (res.ok) {
        setConnectionStatus('online');
      } else {
        setConnectionStatus('offline');
      }
    } catch (e) {
      setConnectionStatus('offline');
    }
  };

  const updateAccessibility = (newAccess: Partial<AccessibilitySettings>) => {
    const updated = { ...accessibility, ...newAccess };
    setAccessibility(updated);
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ accessibility: updated });
      chrome.runtime.sendMessage({
        type: 'SYNC_ACCESSIBILITY_SETTINGS',
        payload: updated
      });
    }
  };

  const toggleMasterPower = () => {
    const newState = !accessibility.enabled;
    updateAccessibility({ enabled: newState });
  };

  const saveProfile = () => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ profile });
      setSaveStatus('PROFILE SAVED!');
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  const saveLlmConfig = () => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ llmConfig });
      setSaveStatus('AI CONFIG SAVED!');
      checkOllamaConnection();
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  // AI Self-Description Auto-Fill Handler
  const handleParseBio = async () => {
    if (!bioInput.trim()) return;

    setIsParsingBio(true);
    try {
      const parsed = await gemmaProvider.parseBioToProfile(bioInput);
      const updatedProfile: UserProfile = {
        ...profile,
        fullName: parsed.fullName || profile.fullName,
        firstName: parsed.firstName || profile.firstName,
        lastName: parsed.lastName || profile.lastName,
        email: parsed.email || profile.email,
        phone: parsed.phone || profile.phone,
        city: parsed.city || profile.city,
        address: parsed.address || profile.address,
        organization: parsed.organization || profile.organization,
        jobTitle: parsed.jobTitle || profile.jobTitle,
        bio: bioInput.trim() || profile.bio
      };

      setProfile(updatedProfile);
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        chrome.storage.local.set({ profile: updatedProfile });
      }
      setSaveStatus('SLOTS AUTO-FILLED BY GEMMA AI!');
      setTimeout(() => setSaveStatus(''), 2500);
    } catch (err) {
      console.error('[Sahayak] Bio parse error:', err);
    } finally {
      setIsParsingBio(false);
    }
  };

  const addCustomField = () => {
    if (!newCustomKey.trim() || !newCustomVal.trim()) return;
    setProfile({
      ...profile,
      customFields: {
        ...profile.customFields,
        [newCustomKey.trim()]: newCustomVal.trim()
      }
    });
    setNewCustomKey('');
    setNewCustomVal('');
  };

  const removeCustomField = (key: string) => {
    const updated = { ...profile.customFields };
    delete updated[key];
    setProfile({ ...profile, customFields: updated });
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 text-sm crt-scanlines">
      {/* 8-Bit Retro Header with Official Logo Icon */}
      <header className="px-4 py-3 bg-slate-900 border-b-2 border-black flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 border-2 border-black ${accessibility.enabled ? 'bg-slate-900 shadow-[2px_2px_0px_#000]' : 'bg-slate-800 opacity-60'} flex items-center justify-center overflow-hidden rounded-sm`}>
            <img src="icons/icon48.png" alt="Sahayak Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-none text-white tracking-wide font-pixel flex items-center gap-1.5">
              <span>SAHAYAK</span>
              <span className="bit-badge bit-badge-cyan">8-BIT</span>
            </h1>
            <p className="text-[11px] text-cyan-400 font-vt323 tracking-wider">OFFLINE GEMMA AI OS</p>
          </div>
        </div>

        {/* 8-BIT RETRO POWER BUTTON */}
        <button
          onClick={toggleMasterPower}
          title={accessibility.enabled ? 'Turn Off Extension' : 'Turn On Extension'}
          className={`bit-btn px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 ${
            accessibility.enabled ? 'bit-btn-success' : 'bit-btn-danger'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          <span className="font-press-start text-[9px]">{accessibility.enabled ? 'ON' : 'OFF'}</span>
        </button>
      </header>

      {/* 8-Bit Navigation Tabs */}
      <nav className="flex bg-slate-900 border-b-2 border-black p-1.5 gap-1.5">
        <button
          onClick={() => setActiveTab('accessibility')}
          className={`flex-1 py-2 px-2 border-2 border-black font-pixel font-bold text-xs flex items-center justify-center gap-1 transition ${
            activeTab === 'accessibility' ? 'bg-cyan-500 text-black shadow-[2px_2px_0px_#000]' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>PAGE UI</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2 px-2 border-2 border-black font-pixel font-bold text-xs flex items-center justify-center gap-1 transition ${
            activeTab === 'profile' ? 'bg-cyan-500 text-black shadow-[2px_2px_0px_#000]' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>VAULT</span>
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-2 px-2 border-2 border-black font-pixel font-bold text-xs flex items-center justify-center gap-1 transition ${
            activeTab === 'ai' ? 'bg-purple-600 text-white shadow-[2px_2px_0px_#000]' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>GEMMA</span>
        </button>
      </nav>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {saveStatus && (
          <div className="p-2.5 bg-emerald-500 text-black font-pixel font-bold text-xs border-2 border-black shadow-[3px_3px_0px_#000] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{saveStatus}</span>
          </div>
        )}

        {!accessibility.enabled && (
          <div className="p-3 bg-amber-500 text-black font-pixel font-bold text-xs border-2 border-black shadow-[3px_3px_0px_#000] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>SAHAYAK IS OFF. CLICK THE [ON] BUTTON TO START AGENT.</span>
          </div>
        )}

        {/* TAB 1: ACCESSIBILITY & UI MODIFIERS */}
        {activeTab === 'accessibility' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-pixel font-bold text-slate-100 flex items-center gap-2 text-sm">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>PAGE UI MODIFIERS</span>
              </h2>
            </div>

            <div className="space-y-3">
              {/* Auto Remove Clutter */}
              <div className="bit-card p-3 flex items-center justify-between border-cyan-500">
                <div>
                  <div className="font-pixel font-bold text-slate-100 flex items-center gap-1.5 text-xs">
                    <span>AUTO REMOVE CLUTTER</span>
                    <span className="bit-badge bit-badge-cyan">AUTO</span>
                  </div>
                  <div className="text-xs text-cyan-300 font-vt323">Hides ads, sticky sidebars & popups</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={accessibility.removeClutter}
                    onChange={(e) => updateAccessibility({ removeClutter: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 border-2 border-black peer-focus:outline-none peer peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-black after:border after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>

              {/* High Contrast */}
              <div className="bit-card p-3 flex items-center justify-between">
                <div>
                  <div className="font-pixel font-bold text-slate-100 text-xs">HIGH CONTRAST MODE</div>
                  <div className="text-xs text-slate-400 font-vt323">Deep dark bg & maximum contrast</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={accessibility.highContrast}
                    onChange={(e) => updateAccessibility({ highContrast: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 border-2 border-black peer-focus:outline-none peer peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-black after:border after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>

              {/* Dyslexia Font */}
              <div className="bit-card p-3 flex items-center justify-between">
                <div>
                  <div className="font-pixel font-bold text-slate-100 text-xs">DYSLEXIA FONT</div>
                  <div className="text-xs text-slate-400 font-vt323">Legible typography & wide spacing</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={accessibility.dyslexiaFont}
                    onChange={(e) => updateAccessibility({ dyslexiaFont: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 border-2 border-black peer-focus:outline-none peer peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-black after:border after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>

              {/* Reader Mode */}
              <div className="bit-card p-3 flex items-center justify-between">
                <div>
                  <div className="font-pixel font-bold text-slate-100 text-xs">READER FOCUS MODE</div>
                  <div className="text-xs text-slate-400 font-vt323">Highlights main article container</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={accessibility.readerMode}
                    onChange={(e) => updateAccessibility({ readerMode: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 border-2 border-black peer-focus:outline-none peer peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-black after:border after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>

              {/* Font Scale Slider */}
              <div className="bit-card p-3 space-y-2">
                <div className="flex justify-between items-center text-xs font-pixel font-bold text-slate-100">
                  <span>FONT SCALE</span>
                  <span className="text-cyan-400">{accessibility.fontScale}%</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="150"
                  step="5"
                  value={accessibility.fontScale}
                  onChange={(e) => updateAccessibility({ fontScale: parseInt(e.target.value) })}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Line Spacing Slider */}
              <div className="bit-card p-3 space-y-2">
                <div className="flex justify-between items-center text-xs font-pixel font-bold text-slate-100">
                  <span>LINE SPACING</span>
                  <span className="text-cyan-400">{accessibility.lineSpacing}x</span>
                </div>
                <input
                  type="range"
                  min="1.2"
                  max="2.0"
                  step="0.1"
                  value={accessibility.lineSpacing}
                  onChange={(e) => updateAccessibility({ lineSpacing: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER PROFILE FOR AUTO-FILL */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-pixel font-bold text-slate-100 flex items-center gap-2 text-sm">
                <UserCheck className="w-4 h-4 text-cyan-400" />
                <span>PROFILE VAULT</span>
              </h2>
              <button
                onClick={saveProfile}
                className="bit-btn bit-btn-primary px-3 py-1.5 text-xs flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>SAVE</span>
              </button>
            </div>

            {/* AI NATURAL LANGUAGE BIO PARSER CARD */}
            <div className="bit-card p-3 border-cyan-500 space-y-2.5 bg-slate-900/90">
              <div className="flex items-center justify-between">
                <div className="font-pixel font-bold text-cyan-400 text-xs flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>AI DESCRIPTION AUTO-FILL</span>
                </div>
                <span className="bit-badge bit-badge-cyan">MAGIC</span>
              </div>
              <p className="text-xs text-slate-400 font-vt323 leading-tight">
                Describe yourself below (e.g. "I am Dhruv Sharma, Senior AI Engineer at Sahayak in New Delhi. Email: dhruv@example.com, Phone: 9876543210")
              </p>
              <textarea
                rows={2}
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                placeholder="Type or paste your bio here..."
                className="w-full bg-slate-950 border-2 border-black px-3 py-1.5 text-xs text-slate-100 font-pixel focus:border-cyan-500 focus:outline-none resize-none"
              />
              <button
                onClick={handleParseBio}
                disabled={isParsingBio || !bioInput.trim()}
                className={`w-full bit-btn py-1.5 text-xs flex items-center justify-center gap-1.5 ${
                  isParsingBio ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bit-btn-primary'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>{isParsingBio ? 'EXTRACTING WITH GEMMA...' : 'AUTO-FILL SLOTS WITH AI'}</span>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-pixel font-bold text-slate-300 uppercase block mb-1">FULL NAME</label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full bg-slate-900 border-2 border-black px-3 py-1.5 text-xs text-slate-100 font-pixel focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-pixel font-bold text-slate-300 uppercase block mb-1">FIRST NAME</label>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    className="w-full bg-slate-900 border-2 border-black px-3 py-1.5 text-xs text-slate-100 font-pixel focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-pixel font-bold text-slate-300 uppercase block mb-1">LAST NAME</label>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    className="w-full bg-slate-900 border-2 border-black px-3 py-1.5 text-xs text-slate-100 font-pixel focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-pixel font-bold text-slate-300 uppercase block mb-1">EMAIL ADDRESS</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full bg-slate-900 border-2 border-black px-3 py-1.5 text-xs text-slate-100 font-pixel focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-pixel font-bold text-slate-300 uppercase block mb-1">PHONE NUMBER</label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full bg-slate-900 border-2 border-black px-3 py-1.5 text-xs text-slate-100 font-pixel focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-pixel font-bold text-slate-300 uppercase block mb-1">CITY / DEFAULT STATION</label>
                <input
                  type="text"
                  value={profile.city}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  className="w-full bg-slate-900 border-2 border-black px-3 py-1.5 text-xs text-slate-100 font-pixel focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* Custom Key-Value Fields */}
              <div className="pt-2 border-t-2 border-black">
                <div className="font-pixel font-bold text-xs text-cyan-400 mb-2">CUSTOM FORM & TRAVEL FIELDS</div>
                <div className="space-y-2 mb-3">
                  {Object.entries(profile.customFields || {}).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2 bg-slate-900 p-2 border-2 border-black shadow-[2px_2px_0px_#000]">
                      <span className="text-xs font-pixel font-bold text-cyan-400 min-w-[90px] truncate">{key}:</span>
                      <span className="text-xs text-slate-200 flex-1 truncate font-vt323 text-sm">{val}</span>
                      <button
                        onClick={() => removeCustomField(key)}
                        className="text-red-400 hover:text-red-300 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Field (e.g. Roll No)"
                    value={newCustomKey}
                    onChange={(e) => setNewCustomKey(e.target.value)}
                    className="flex-1 bg-slate-900 border-2 border-black px-2 py-1 text-xs text-slate-100 font-pixel"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={newCustomVal}
                    onChange={(e) => setNewCustomVal(e.target.value)}
                    className="flex-1 bg-slate-900 border-2 border-black px-2 py-1 text-xs text-slate-100 font-pixel"
                  />
                  <button
                    onClick={addCustomField}
                    className="bit-btn bit-btn-primary px-2.5 py-1 text-xs flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GEMMA 4B MODEL & AI CONFIG */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-pixel font-bold text-slate-100 flex items-center gap-2 text-sm">
                <Cpu className="w-4 h-4 text-purple-400" />
                <span>GEMMA 4B ENGINE</span>
              </h2>
              <button
                onClick={saveLlmConfig}
                className="bit-btn bit-btn-purple px-3 py-1.5 text-xs flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>SAVE</span>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-pixel font-bold text-slate-300 uppercase block mb-1">AI ENGINE MODE</label>
                <select
                  value={llmConfig.provider}
                  onChange={(e) => setLlmConfig({ ...llmConfig, provider: e.target.value as any })}
                  className="w-full bg-slate-900 border-2 border-black px-3 py-1.5 text-xs text-slate-100 font-pixel focus:border-purple-500 focus:outline-none"
                >
                  <option value="ollama">Local Ollama Offline API (Recommended)</option>
                  <option value="chrome_ai">Chrome Built-in AI / Prompt API</option>
                  <option value="heuristic_fallback">Zero-Lag Rule Engine</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-pixel font-bold text-slate-300 uppercase block mb-1">OLLAMA HOST URL</label>
                <input
                  type="text"
                  value={llmConfig.ollamaEndpoint}
                  onChange={(e) => setLlmConfig({ ...llmConfig, ollamaEndpoint: e.target.value })}
                  className="w-full bg-slate-900 border-2 border-black px-3 py-1.5 text-xs text-slate-100 font-pixel focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-pixel font-bold text-slate-300 uppercase block mb-1">MODEL ID</label>
                <input
                  type="text"
                  value={llmConfig.modelName}
                  onChange={(e) => setLlmConfig({ ...llmConfig, modelName: e.target.value })}
                  className="w-full bg-slate-900 border-2 border-black px-3 py-1.5 text-xs text-slate-100 font-pixel focus:border-purple-500 focus:outline-none"
                  placeholder="gemma2:2b, gemma:7b, gemma:4b"
                />
              </div>

              <div className="bit-card p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-pixel font-bold text-slate-200">OLLAMA ENGINE STATUS</span>
                  <button
                    onClick={checkOllamaConnection}
                    className="text-xs font-vt323 text-purple-400 hover:underline text-sm"
                  >
                    TEST CONNECTION
                  </button>
                </div>

                {connectionStatus === 'online' ? (
                  <div className="text-xs text-emerald-400 flex items-center gap-1.5 font-pixel">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>CONNECTED ({llmConfig.modelName})</span>
                  </div>
                ) : (
                  <div className="text-xs text-amber-400 flex items-center gap-1.5 font-pixel">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>OLLAMA OFFLINE. BUILT-IN RULE ENGINE ACTIVE.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
