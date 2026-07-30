import { FormFieldMetadata, AIExplanationResult, UserProfile, LLMConfig } from '../types/index';
import { buildFieldExplanationPrompt, buildFieldAutofillPrompt } from './prompts';

export class GemmaOfflineProvider {
  private config: LLMConfig;

  constructor(config?: Partial<LLMConfig>) {
    this.config = {
      provider: 'ollama',
      ollamaEndpoint: 'http://localhost:11434',
      modelName: 'gemma2:2b',
      temperature: 0.2,
      ...config
    };
  }

  public updateConfig(newConfig: Partial<LLMConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Parses a natural language self-description into structured UserProfile fields.
   */
  public async parseBioToProfile(descriptionText: string): Promise<Partial<UserProfile>> {
    const prompt = `You are Sahayak AI. Extract structured profile data from the user's self-description.

Description:
"${descriptionText}"

Extract and return ONLY a JSON object with these keys (leave empty string if not mentioned):
{
  "fullName": "Full Name",
  "firstName": "First Name",
  "lastName": "Last Name",
  "email": "email address",
  "phone": "phone number",
  "city": "City or station",
  "address": "Street address",
  "organization": "Company or University",
  "jobTitle": "Job title or role",
  "bio": "Short summary",
  "customFields": {}
}`;

    // Try Ollama LLM
    try {
      const response = await fetch(`${this.config.ollamaEndpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.modelName,
          prompt: prompt,
          stream: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        const json = this.extractJSON(data.response);
        if (json && (json.fullName || json.email || json.phone || json.city)) {
          return json;
        }
      }
    } catch (err) {
      console.warn('[Sahayak Gemma] Ollama bio parsing offline, using smart heuristic parser:', err);
    }

    // Heuristic Bio Parser Fallback
    return this.heuristicBioParser(descriptionText);
  }

  private heuristicBioParser(text: string): Partial<UserProfile> {
    const result: Partial<UserProfile> = {};
    const customFields: Record<string, string> = {};

    // Extract Email
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) result.email = emailMatch[0];

    // Extract Phone
    const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10}\b/);
    if (phoneMatch) result.phone = phoneMatch[0];

    // Extract Name ("I am John Doe", "My name is John Doe", "Name: John Doe")
    const nameMatch = text.match(/(?:my name is|i am|i'm|name[:\s]+)\s*([A-[Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i);
    if (nameMatch && nameMatch[1]) {
      result.fullName = nameMatch[1].trim();
      const parts = result.fullName.split(' ');
      result.firstName = parts[0];
      result.lastName = parts.slice(1).join(' ');
    }

    // Extract City / Station ("based in New Delhi", "living in Mumbai", "city New Delhi", "station NDLS")
    const cityMatch = text.match(/(?:based in|living in|city|station|from)\s+([A-Za-z\s]+?)(?=[,.]|\s+and|\s+my|\s+with|$)/i);
    if (cityMatch && cityMatch[1]) {
      result.city = cityMatch[1].trim();
    }

    // Extract Organization / Company ("working at Sahayak", "developer at Google", "company Sahayak AI")
    const orgMatch = text.match(/(?:at|company|organization|university|college)\s+([A-Za-z0-9\s]+?)(?=[,.]|\s+as|\s+my|\s+in|$)/i);
    if (orgMatch && orgMatch[1]) {
      result.organization = orgMatch[1].trim();
    }

    // Extract Job Title ("working as AI Engineer", "role Senior Developer")
    const roleMatch = text.match(/(?:working as|role|job|title|position)\s+([A-Za-z\s]+?)(?=[,.]|\s+at|\s+my|\s+in|$)/i);
    if (roleMatch && roleMatch[1]) {
      result.jobTitle = roleMatch[1].trim();
    }

    result.bio = text.substring(0, 150);
    result.customFields = customFields;

    return result;
  }

  /**
   * Explains what a form field requires using Gemma AI or smart heuristic fallback.
   */
  public async explainField(field: FormFieldMetadata): Promise<AIExplanationResult> {
    const prompt = buildFieldExplanationPrompt(field);

    // Try Chrome Built-in AI / Prompt API first if enabled
    if (this.config.provider === 'chrome_ai' && typeof (window as any).ai?.languageModel !== 'undefined') {
      try {
        const session = await (window as any).ai.languageModel.create();
        const rawResponse = await session.prompt(prompt);
        const json = this.extractJSON(rawResponse);
        if (json && json.explanation && json.explanation.length > 10) {
          return {
            explanation: json.explanation,
            suggestedInputType: json.suggestedInputType || field.type,
            exampleValue: json.exampleValue || ''
          };
        }
      } catch (err) {
        console.warn('[Sahayak Gemma] Chrome AI failed, falling back to Ollama/Heuristics:', err);
      }
    }

    // Try Ollama Local Gemma 4B / Gemma 2B offline API
    if (this.config.provider === 'ollama' || this.config.provider === 'chrome_ai') {
      try {
        const response = await fetch(`${this.config.ollamaEndpoint}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: this.config.modelName,
            prompt: prompt,
            stream: false,
            options: { temperature: this.config.temperature }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const json = this.extractJSON(data.response);
          if (json && json.explanation && json.explanation.length > 10) {
            return {
              explanation: json.explanation,
              suggestedInputType: json.suggestedInputType || field.type,
              exampleValue: json.exampleValue || ''
            };
          }
        }
      } catch (err) {
        console.warn('[Sahayak Gemma] Ollama local API offline, using smart rule engine:', err);
      }
    }

    // Smart Contextual Rule Engine (Guarantees immediate rich response)
    return this.heuristicFieldExplanation(field);
  }

  /**
   * Auto-fills a form field using stored user profile data and Gemma matching.
   */
  public async autofillField(field: FormFieldMetadata, userProfile: UserProfile): Promise<string> {
    const prompt = buildFieldAutofillPrompt(field, userProfile);

    // Try Ollama Offline LLM
    try {
      const response = await fetch(`${this.config.ollamaEndpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.modelName,
          prompt: prompt,
          stream: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        const json = this.extractJSON(data.response);
        if (json && json.autofillValue !== undefined && json.autofillValue !== '') {
          return json.autofillValue;
        }
      }
    } catch (err) {
      // Fallthrough to heuristic profile matcher
    }

    return this.heuristicProfileMatcher(field, userProfile);
  }

  private heuristicFieldExplanation(field: FormFieldMetadata): AIExplanationResult {
    const labelLower = (field.label + ' ' + (field.placeholder || '') + ' ' + (field.name || '') + ' ' + (field.ariaLabel || '')).toLowerCase();

    if (labelLower.includes('to station') || labelLower.includes('destination') || labelLower.includes('to')) {
      return {
        explanation: 'Enter the destination railway station name or station code where you are traveling to (e.g. NDLS for New Delhi, BCT for Mumbai Central, HWH for Howrah).',
        suggestedInputType: 'Station Name / Code',
        exampleValue: 'NDLS - New Delhi'
      };
    }
    if (labelLower.includes('from station') || labelLower.includes('origin') || labelLower.includes('boarding') || labelLower.includes('from')) {
      return {
        explanation: 'Enter your departure or boarding railway station name or station code from where your journey begins.',
        suggestedInputType: 'Station Name / Code',
        exampleValue: 'NDLS - New Delhi'
      };
    }

    if (labelLower.includes('date') || labelLower.includes('journey') || labelLower.includes('departure')) {
      return {
        explanation: 'Select or enter your planned date of travel in DD/MM/YYYY format.',
        suggestedInputType: 'Date (DD/MM/YYYY)',
        exampleValue: '15/08/2026'
      };
    }

    if (labelLower.includes('quota') || labelLower.includes('class') || labelLower.includes('category')) {
      return {
        explanation: 'Select your booking quota (e.g., General, Tatkal, Ladies, Senior Citizen).',
        suggestedInputType: 'Dropdown Option',
        exampleValue: 'GENERAL'
      };
    }

    if (labelLower.includes('name') || labelLower.includes('passenger')) {
      return {
        explanation: 'Enter full official passenger name as printed on ID proof.',
        suggestedInputType: 'Text',
        exampleValue: 'Dhruv Sharma'
      };
    }
    if (labelLower.includes('email') || labelLower.includes('mail')) {
      return {
        explanation: 'Provide a valid email address for receiving your ticket confirmation and updates.',
        suggestedInputType: 'Email Address',
        exampleValue: 'user@example.com'
      };
    }
    if (labelLower.includes('phone') || labelLower.includes('mobile') || labelLower.includes('contact')) {
      return {
        explanation: 'Enter an active 10-digit mobile number for receiving SMS alerts and updates.',
        suggestedInputType: 'Phone Number',
        exampleValue: '9876543210'
      };
    }

    const cleanLabel = field.label ? field.label.replace(/Enter|Input|is|Mandatory|\./gi, '').trim() : 'Field';
    return {
      explanation: `Specify the required information for "${cleanLabel || 'this input'}". Ensure the details are accurate before submitting.`,
      suggestedInputType: field.type || 'Text',
      exampleValue: field.placeholder || 'Enter value...'
    };
  }

  private heuristicProfileMatcher(field: FormFieldMetadata, profile: UserProfile): string {
    const key = (field.label + ' ' + (field.name || '') + ' ' + (field.ariaLabel || '')).toLowerCase();

    if (key.includes('to station') || key.includes('destination')) {
      return profile.city ? `${profile.city}` : 'NDLS - New Delhi';
    }
    if (key.includes('from station') || key.includes('origin') || key.includes('boarding')) {
      return profile.city ? `${profile.city}` : 'NDLS - New Delhi';
    }

    if (key.includes('first name')) return profile.firstName || profile.fullName.split(' ')[0] || '';
    if (key.includes('last name')) return profile.lastName || profile.fullName.split(' ').slice(1).join(' ') || '';
    if (key.includes('full name') || key.includes('name') || key.includes('passenger')) return profile.fullName || 'Dhruv Sharma';
    if (key.includes('email') || key.includes('mail')) return profile.email || 'dhruv@example.com';
    if (key.includes('phone') || key.includes('mobile') || key.includes('contact')) return profile.phone || '9876543210';
    if (key.includes('city')) return profile.city || 'San Francisco';
    if (key.includes('state')) return profile.state || 'CA';
    if (key.includes('zip') || key.includes('postal')) return profile.zipCode || '94107';
    if (key.includes('country')) return profile.country || 'United States';
    if (key.includes('address') || key.includes('street')) return profile.address || '123 Innovation Way';
    if (key.includes('company') || key.includes('organization') || key.includes('work')) return profile.organization || 'Sahayak AI Labs';
    if (key.includes('title') || key.includes('job') || key.includes('role')) return profile.jobTitle || 'AI Developer';
    if (key.includes('bio') || key.includes('about')) return profile.bio || 'AI Developer';

    for (const [cKey, val] of Object.entries(profile.customFields || {})) {
      if (key.includes(cKey.toLowerCase())) return val;
    }

    return profile.fullName || 'Dhruv Sharma';
  }

  private extractJSON(text: string): any {
    try {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
    } catch (e) {
      // ignore
    }
    return null;
  }
}
