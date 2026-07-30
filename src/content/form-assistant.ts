import { FormFieldMetadata, UserProfile, AIExplanationResult } from '../types/index';
import { GemmaOfflineProvider } from '../ai/gemma-provider';

export class FormAssistant {
  private gemmaProvider: GemmaOfflineProvider;
  private userProfile: UserProfile | null = null;
  private observer: MutationObserver | null = null;
  private activePopover: HTMLElement | null = null;
  private scanInterval: any = null;
  private isEnabled: boolean = true;

  constructor() {
    this.gemmaProvider = new GemmaOfflineProvider();
    this.loadProfile();
  }

  private async loadProfile() {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get(['profile', 'llmConfig', 'accessibility'], (result) => {
        if (result.profile) {
          this.userProfile = result.profile;
        }
        if (result.llmConfig) {
          this.gemmaProvider.updateConfig(result.llmConfig);
        }
        if (result.accessibility && result.accessibility.enabled !== undefined) {
          this.isEnabled = result.accessibility.enabled;
          if (!this.isEnabled) {
            this.removeAllBadges();
          }
        }
      });
    }
  }

  public init() {
    this.scanAndInject();
    this.setupMutationObserver();
    this.setupPeriodicScan();
    this.listenToStorageChanges();
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.removeAllBadges();
    } else {
      this.scanAndInject();
    }
  }

  public removeAllBadges() {
    document.querySelectorAll('.sahayak-badge-wrapper').forEach((el) => el.remove());
    document.querySelectorAll('[data-sahayak-injected]').forEach((el) => {
      delete (el as HTMLElement).dataset.sahayakInjected;
    });
    if (this.activePopover) {
      this.activePopover.remove();
      this.activePopover = null;
    }
  }

  private listenToStorageChanges() {
    if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'local') {
          if (changes.profile) {
            this.userProfile = changes.profile.newValue;
          }
          if (changes.llmConfig) {
            this.gemmaProvider.updateConfig(changes.llmConfig.newValue);
          }
          if (changes.accessibility) {
            const acc = changes.accessibility.newValue;
            if (acc && acc.enabled !== undefined) {
              this.setEnabled(acc.enabled);
            }
          }
        }
      });
    }
  }

  private setupMutationObserver() {
    this.observer = new MutationObserver(() => {
      if (this.isEnabled) {
        this.scanAndInject();
      }
    });
    this.observer.observe(document.body, { childList: true, subtree: true });
  }

  private setupPeriodicScan() {
    if (this.scanInterval) clearInterval(this.scanInterval);
    this.scanInterval = setInterval(() => {
      if (this.isEnabled) {
        this.scanAndInject();
      }
    }, 1500);
  }

  public scanAndInject() {
    if (!this.isEnabled) return;

    // 1. Scan standard HTML Form Inputs & textareas
    const standardInputs = document.querySelectorAll<HTMLElement>(
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="image"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]), textarea, select, [contenteditable="true"], [role="textbox"], [role="combobox"]'
    );

    standardInputs.forEach((input) => {
      if (!input.dataset.sahayakInjected) {
        this.injectInfoBadge(input, 'standard_form');
      }
    });

    // 2. Scan Google Forms Items & Custom Question Containers
    const googleFormItems = document.querySelectorAll<HTMLElement>(
      'div[role="listitem"], div[jsmodel], .freebirdFormviewerComponentsQuestionBaseRoot'
    );
    googleFormItems.forEach((item) => {
      const inputEl = item.querySelector<HTMLElement>(
        'input, textarea, [role="textbox"], [role="radio"], [role="checkbox"], [role="listbox"]'
      );
      if (inputEl && !inputEl.dataset.sahayakInjected) {
        this.injectInfoBadge(inputEl, 'google_form', item);
      }
    });
  }

  private injectInfoBadge(targetEl: HTMLElement, formType: 'google_form' | 'standard_form', containerEl?: HTMLElement) {
    targetEl.dataset.sahayakInjected = 'true';

    // Create small, sleek black i badge button
    const badge = document.createElement('button');
    badge.type = 'button';
    badge.className = 'sahayak-info-badge';
    badge.setAttribute('aria-label', 'Sahayak AI Field Assistant');
    badge.title = 'Sahayak AI Assistant (Click for field explanation & auto-fill)';
    badge.innerHTML = `
      <span class="sahayak-badge-icon">i</span>
      <span class="sahayak-badge-pulse"></span>
    `;

    const wrapper = document.createElement('span');
    wrapper.className = 'sahayak-badge-wrapper';
    wrapper.appendChild(badge);

    const parent = targetEl.parentElement;
    if (parent) {
      if (targetEl.nextSibling) {
        parent.insertBefore(wrapper, targetEl.nextSibling);
      } else {
        parent.appendChild(wrapper);
      }
    }

    badge.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.togglePopover(badge, targetEl, formType, containerEl);
    });
  }

  private async togglePopover(badgeEl: HTMLElement, targetEl: HTMLElement, formType: 'google_form' | 'standard_form', containerEl?: HTMLElement) {
    if (this.activePopover) {
      this.activePopover.remove();
      this.activePopover = null;
    }

    const fieldMeta = this.extractMetadata(targetEl, formType, containerEl);
    
    const popover = document.createElement('div');
    popover.className = 'sahayak-popover';
    popover.innerHTML = `
      <div class="sahayak-popover-header">
        <div class="sahayak-popover-title">
          <span>Sahayak Field Assistant</span>
          <span class="sahayak-gemma-tag">Gemma AI</span>
        </div>
        <button type="button" class="sahayak-popover-close">&times;</button>
      </div>
      <div class="sahayak-popover-body">
        <div class="sahayak-field-name">Target Field: <strong style="color: #60a5fa;">${fieldMeta.label}</strong></div>
        
        <div class="sahayak-loading-spinner" id="sahayak-loading">
          <div class="sahayak-spinner"></div>
          <span>Analyzing field requirement with Gemma AI...</span>
        </div>

        <div class="sahayak-result-card hidden" id="sahayak-result">
          <div class="sahayak-explanation-box">
            <div class="sahayak-section-label">Field Requirement:</div>
            <p id="sahayak-explanation-text"></p>
          </div>
          
          <div class="sahayak-meta-row">
            <div><span class="sahayak-meta-title">Format:</span> <span id="sahayak-type-text"></span></div>
            <div><span class="sahayak-meta-title">Sample:</span> <span id="sahayak-sample-text"></span></div>
          </div>
        </div>

        <div class="sahayak-popover-actions">
          <button type="button" class="sahayak-btn sahayak-btn-autofill" id="sahayak-btn-autofill">
            <span>AI Auto-Fill</span>
          </button>
          <button type="button" class="sahayak-btn sahayak-btn-secondary" id="sahayak-btn-reexplain">
            <span>Refresh</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(popover);
    this.activePopover = popover;

    // Position Popover nicely relative to badge
    const rect = badgeEl.getBoundingClientRect();
    popover.style.top = `${window.scrollY + rect.bottom + 8}px`;
    popover.style.left = `${Math.max(10, Math.min(window.scrollX + rect.left, window.innerWidth - 350))}px`;

    // Close handler
    const closeBtn = popover.querySelector('.sahayak-popover-close');
    closeBtn?.addEventListener('click', () => {
      popover.remove();
      this.activePopover = null;
    });

    // Refresh handler
    const refreshBtn = popover.querySelector('#sahayak-btn-reexplain');
    refreshBtn?.addEventListener('click', async () => {
      const loadingEl = popover.querySelector('#sahayak-loading');
      const resultEl = popover.querySelector('#sahayak-result');
      if (loadingEl) loadingEl.classList.remove('hidden');
      if (resultEl) resultEl.classList.add('hidden');
      await this.loadExplanationIntoPopover(popover, fieldMeta);
    });

    // Auto-fill handler
    const autofillBtn = popover.querySelector('#sahayak-btn-autofill');
    autofillBtn?.addEventListener('click', async () => {
      autofillBtn.classList.add('sahayak-btn-loading');
      const profileToUse = this.userProfile || {
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
        jobTitle: 'AI Developer',
        bio: 'AI Developer',
        customFields: {}
      };

      const val = await this.gemmaProvider.autofillField(fieldMeta, profileToUse);
      autofillBtn.classList.remove('sahayak-btn-loading');

      if (val) {
        this.fillFieldValue(targetEl, val);
        popover.remove();
        this.activePopover = null;
      }
    });

    // Fetch AI Explanation
    await this.loadExplanationIntoPopover(popover, fieldMeta);
  }

  private async loadExplanationIntoPopover(popover: HTMLElement, fieldMeta: FormFieldMetadata) {
    try {
      const explanationResult: AIExplanationResult = await this.gemmaProvider.explainField(fieldMeta);
      
      const loadingEl = popover.querySelector('#sahayak-loading');
      const resultEl = popover.querySelector('#sahayak-result');
      const textEl = popover.querySelector('#sahayak-explanation-text');
      const typeEl = popover.querySelector('#sahayak-type-text');
      const sampleEl = popover.querySelector('#sahayak-sample-text');

      if (loadingEl) loadingEl.classList.add('hidden');
      if (resultEl) resultEl.classList.remove('hidden');
      if (textEl) textEl.textContent = explanationResult.explanation;
      if (typeEl) typeEl.textContent = explanationResult.suggestedInputType;
      if (sampleEl) sampleEl.textContent = explanationResult.exampleValue;

    } catch (err) {
      console.error('[Sahayak] Explanation error:', err);
    }
  }

  private fillFieldValue(targetEl: HTMLElement, value: string) {
    if (targetEl instanceof HTMLInputElement || targetEl instanceof HTMLTextAreaElement) {
      targetEl.focus();
      targetEl.value = value;
      
      // Dispatch key & input events so framework/autocomplete forms trigger dropdowns/state updates
      targetEl.dispatchEvent(new Event('focus', { bubbles: true }));
      targetEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
      targetEl.dispatchEvent(new Event('input', { bubbles: true }));
      targetEl.dispatchEvent(new KeyboardEvent('keyup', { key: 'a', bubbles: true }));
      targetEl.dispatchEvent(new Event('change', { bubbles: true }));
      targetEl.dispatchEvent(new Event('blur', { bubbles: true }));
      
      targetEl.style.transition = 'box-shadow 0.3s ease, border-color 0.3s ease';
      targetEl.style.border = '2px solid #2563eb';
      targetEl.style.boxShadow = '0 0 0 4px rgba(37, 99, 235, 0.4)';
      setTimeout(() => {
        targetEl.style.boxShadow = '';
      }, 1800);
    } else if (targetEl.getAttribute('contenteditable') === 'true') {
      targetEl.focus();
      targetEl.textContent = value;
      targetEl.dispatchEvent(new Event('input', { bubbles: true }));
      targetEl.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (targetEl instanceof HTMLSelectElement) {
      for (let i = 0; i < targetEl.options.length; i++) {
        if (targetEl.options[i].text.toLowerCase().includes(value.toLowerCase())) {
          targetEl.selectedIndex = i;
          break;
        }
      }
      targetEl.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  private extractMetadata(targetEl: HTMLElement, formType: 'google_form' | 'standard_form', containerEl?: HTMLElement): FormFieldMetadata {
    let labelText = '';

    if (containerEl || formType === 'google_form') {
      const parentContainer = containerEl || targetEl.closest('div[role="listitem"], div[jsmodel], .freebirdFormviewerComponentsQuestionBaseRoot');
      if (parentContainer) {
        const heading = parentContainer.querySelector('[role="heading"], .M7eMe, .exportLabel, .freebirdFormviewerComponentsQuestionBaseTitle');
        if (heading) {
          labelText = heading.textContent?.trim() || '';
        }
      }
    }

    if (!labelText && targetEl.id) {
      const labelEl = document.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(targetEl.id)}"]`);
      if (labelEl) labelText = labelEl.textContent?.trim() || '';
    }

    if (!labelText) {
      const closestLabel = targetEl.closest('label');
      if (closestLabel) labelText = closestLabel.textContent?.trim() || '';
    }

    if (!labelText) {
      // Check placeholder or aria-label
      labelText = targetEl.getAttribute('aria-label') || targetEl.getAttribute('placeholder') || '';
    }

    if (!labelText) {
      // Find preceding sibling text/heading
      let sibling = targetEl.previousElementSibling;
      while (sibling && !labelText) {
        if (['LABEL', 'SPAN', 'P', 'H1', 'H2', 'H3', 'H4', 'DIV'].includes(sibling.tagName)) {
          const txt = sibling.textContent?.trim();
          if (txt && txt.length < 80) {
            labelText = txt;
            break;
          }
        }
        sibling = sibling.previousElementSibling;
      }
    }

    if (!labelText) {
      labelText = targetEl.getAttribute('title') || targetEl.getAttribute('name') || targetEl.id || 'Input Field';
    }

    // Clean up label text
    labelText = labelText.replace(/Input is Mandatory|Mandatory|[*:]/gi, '').replace(/\s+/g, ' ').trim();

    return {
      id: targetEl.id || targetEl.getAttribute('name') || Math.random().toString(36).substr(2, 9),
      name: targetEl.getAttribute('name') || undefined,
      type: (targetEl as any).type || 'text',
      label: labelText || 'Target Field',
      placeholder: targetEl.getAttribute('placeholder') || undefined,
      ariaLabel: targetEl.getAttribute('aria-label') || undefined,
      isRequired: targetEl.hasAttribute('required') || targetEl.getAttribute('aria-required') === 'true',
      formType: formType,
      surroundingContext: containerEl?.textContent?.substring(0, 200)
    };
  }
}
