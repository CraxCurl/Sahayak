/**
 * CSS Sanitizer & Safety Boundary (Phase 2 & Phase 3, Requirement 3.3).
 * Allowlist filter for AI-authored CSS patches to prevent viewport takeover or security exploits.
 */
export function sanitizeCSS(css: string): string {
  if (!css) return '';

  let sanitized = css.trim();

  // Reject declarations containing security risks: @import, url(), expression(), javascript:, position: fixed + z-index > 1000
  if (
    /@import/i.test(sanitized) ||
    /expression\(/i.test(sanitized) ||
    /javascript:/i.test(sanitized) ||
    /url\(\s*["']?(?!data:)[^"')]+\s*["']?\)/i.test(sanitized)
  ) {
    console.warn('[CSS Sanitizer] Rejected unsafe CSS rule containing blocked keywords/urls:', css);
    return '';
  }

  // Prevent viewport takeover: position: fixed combined with z-index above 10000
  if (/position\s*:\s*fixed/i.test(sanitized) && /z-index\s*:\s*(\d{5,})/i.test(sanitized)) {
    console.warn('[CSS Sanitizer] Rejected fixed position rules with high z-index (viewport takeover risk):', css);
    return '';
  }

  // Prevent all: unset at broad body/html scopes
  if (/all\s*:\s*unset/i.test(sanitized) && /(html|body|\*)/i.test(sanitized)) {
    console.warn('[CSS Sanitizer] Rejected broad all:unset rule:', css);
    return '';
  }

  return sanitized;
}
