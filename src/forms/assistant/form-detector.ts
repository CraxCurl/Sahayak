export interface FormFieldInfo {
  id: string;
  name: string;
  type: string;
  placeholder: string;
  label: string;
}

export class FormDetector {
  public detectFormFields(): FormFieldInfo[] {
    const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
    return inputs.map((input, idx) => {
      const el = input as HTMLInputElement;
      const label = document.querySelector(`label[for="${el.id}"]`)?.textContent?.trim() || '';
      return {
        id: el.id || `field-${idx}`,
        name: el.name || '',
        type: el.type || 'text',
        placeholder: el.placeholder || '',
        label,
      };
    });
  }
}
