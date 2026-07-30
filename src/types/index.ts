export interface UserProfile {
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  organization: string;
  jobTitle: string;
  bio: string;
  dateOfBirth?: string;
  gender?: string;
  customFields: Record<string, string>;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  dyslexiaFont: boolean;
  fontScale: number; // 100 to 150
  removeClutter: boolean;
  simplifyLayout: boolean;
  lineSpacing: number; // 1.2 to 2.0
  readerMode: boolean;
  enabled: boolean;
}

export type FormType = 'google_form' | 'standard_form';

export interface FormFieldMetadata {
  id: string;
  name?: string;
  type: string;
  label: string;
  placeholder?: string;
  ariaLabel?: string;
  ariaDescription?: string;
  isRequired: boolean;
  formType: FormType;
  surroundingContext?: string;
  options?: string[];
}

export interface AIExplanationResult {
  explanation: string;
  suggestedInputType: string;
  exampleValue: string;
  autofillValue?: string;
}

export type LLMProviderType = 'chrome_ai' | 'ollama' | 'webllm' | 'heuristic_fallback';

export interface LLMConfig {
  provider: LLMProviderType;
  ollamaEndpoint: string; // default http://localhost:11434
  modelName: string; // default gemma2:2b or gemma:7b or gemma-4b
  temperature: number;
}

export interface SahayakState {
  accessibility: AccessibilitySettings;
  profile: UserProfile;
  llmConfig: LLMConfig;
}
