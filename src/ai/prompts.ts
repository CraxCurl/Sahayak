import { FormFieldMetadata, UserProfile } from '../types/index';

export function buildFieldExplanationPrompt(field: FormFieldMetadata): string {
  return `You are Sahayak, an intelligent accessibility AI assistant powered by Gemma.
Analyze the following web form field and explain clearly to the user what they need to enter in simple, accessible language.

Field Label: "${field.label}"
Field Name/ID: "${field.name || field.id}"
Field Type: "${field.type}"
Placeholder: "${field.placeholder || 'None'}"
Required: ${field.isRequired ? 'Yes' : 'No'}
Form Type: ${field.formType === 'google_form' ? 'Google Form' : 'Standard Web Form'}
Context: "${field.surroundingContext || 'None'}"
${field.options ? `Select Options: ${field.options.join(', ')}` : ''}

Provide a response in JSON format with exactly three keys:
{
  "explanation": "Short 1-2 sentence plain language explanation of what this field asks for",
  "suggestedInputType": "e.g. text, email, date, number, selection",
  "exampleValue": "A realistic sample value for this field"
}`;
}

export function buildFieldAutofillPrompt(field: FormFieldMetadata, userProfile: UserProfile): string {
  const profileSummary = JSON.stringify(userProfile, null, 2);
  
  return `You are Sahayak, an AI form auto-fill engine powered by Gemma.
Given the target form field and the user's stored personal profile, determine the exact best value from the user's profile to fill into this field.

Target Field Details:
- Label: "${field.label}"
- Name/ID: "${field.name || field.id}"
- Type: "${field.type}"
- Placeholder: "${field.placeholder || ''}"
${field.options ? `- Allowed Options: ${JSON.stringify(field.options)}` : ''}

User Profile Data:
${profileSummary}

Instruction:
1. Match the field purpose (e.g. name, email, address, phone, job title, bio, etc.) with the user profile.
2. If options are provided, pick the exact option matching the user profile.
3. Return ONLY a JSON object:
{
  "autofillValue": "the exact string value to populate into the input field",
  "confidence": 0.95,
  "matchedProperty": "property_name_from_profile"
}
If no matching profile data exists, return "autofillValue": "".`;
}
