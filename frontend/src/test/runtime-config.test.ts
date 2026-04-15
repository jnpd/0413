import { describe, expect, it } from 'vitest';
import { resolveApiBaseUrl } from '../config/runtime';

describe('resolveApiBaseUrl', () => {
  it('uses same-origin requests in dev when no explicit API base URL is configured', () => {
    expect(resolveApiBaseUrl('', true)).toBe('');
    expect(resolveApiBaseUrl(undefined, true)).toBe('');
  });

  it('prefers the explicit API base URL when provided', () => {
    expect(resolveApiBaseUrl('http://localhost:8010', true)).toBe('http://localhost:8010');
  });

  it('falls back to the backend origin outside dev mode', () => {
    expect(resolveApiBaseUrl('', false)).toBe('http://localhost:8010');
  });
});
