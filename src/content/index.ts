import { PageEnhancer } from './page-enhancer';
import { FormAssistant } from './form-assistant';
import { AccessibilitySettings } from '../types/index';
import './content.css';

console.log('[Sahayak] Sahayak AI Content Script initialized.');

const pageEnhancer = new PageEnhancer();
const formAssistant = new FormAssistant();

// Initialize Form Assistant for HTML forms & Google Forms
formAssistant.init();

// Load initial saved accessibility settings
if (typeof chrome !== 'undefined' && chrome.storage?.local) {
  chrome.storage.local.get(['accessibility'], (result) => {
    if (result.accessibility) {
      pageEnhancer.applySettings(result.accessibility);
    } else {
      // Default enabled accessibility setting
      const defaultSettings: AccessibilitySettings = {
        enabled: true,
        highContrast: false,
        dyslexiaFont: false,
        fontScale: 100,
        removeClutter: false,
        simplifyLayout: false,
        lineSpacing: 1.2,
        readerMode: false
      };
      chrome.storage.local.set({ accessibility: defaultSettings });
      pageEnhancer.applySettings(defaultSettings);
    }
  });

  // Real-time accessibility storage listener
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.accessibility) {
      const newSettings = changes.accessibility.newValue as AccessibilitySettings;
      console.log('[Sahayak] Real-time accessibility update applied:', newSettings);
      pageEnhancer.applySettings(newSettings);
    }
  });
}

// Listen for direct runtime messages from sidepanel / service worker
if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'APPLY_ACCESSIBILITY_SETTINGS') {
      pageEnhancer.applySettings(message.payload as AccessibilitySettings);
      sendResponse({ status: 'applied' });
    }
  });
}
