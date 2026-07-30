// Sahayak Service Worker (Manifest V3)

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Sahayak Background] Extension installed successfully.');

  // Set default initial state with removeClutter: true by default!
  chrome.storage.local.get(['accessibility', 'profile', 'llmConfig'], (res) => {
    if (!res.accessibility) {
      chrome.storage.local.set({
        accessibility: {
          enabled: true,
          highContrast: false,
          dyslexiaFont: false,
          fontScale: 100,
          removeClutter: true, // Auto remove clutter on startup
          simplifyLayout: false,
          lineSpacing: 1.2,
          readerMode: false
        }
      });
    }

    if (!res.profile) {
      chrome.storage.local.set({
        profile: {
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
          bio: 'AI Engineer working on browser extensions and local accessibility engines.',
          customFields: {
            'Destination': 'NDLS - New Delhi',
            'Boarding Station': 'NDLS - New Delhi'
          }
        }
      });
    }

    if (!res.llmConfig) {
      chrome.storage.local.set({
        llmConfig: {
          provider: 'ollama',
          ollamaEndpoint: 'http://localhost:11434',
          modelName: 'gemma2:2b',
          temperature: 0.2
        }
      });
    }
  });

  // Enable sidepanel behavior on icon click
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((err) => {
      console.error('[Sahayak] Failed to set side panel behavior:', err);
    });
  }
});

// Relay messages to content script of active tab
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SYNC_ACCESSIBILITY_SETTINGS') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'APPLY_ACCESSIBILITY_SETTINGS',
          payload: message.payload
        }).catch((err) => console.warn('[Sahayak] Tab message failed:', err));
      }
    });
    sendResponse({ status: 'relayed' });
  }
  return true;
});
