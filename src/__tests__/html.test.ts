import { escapeHtml } from '../utils/html';

describe('escapeHtml', () => {
  it('escapes special characters into HTML entities', () => {
    const input = "<div>&\"'";
    const output = escapeHtml(input);
    expect(output).toBe('&lt;div&gt;&amp;"\'');
  });

  it('returns empty string for undefined', () => {
    // @ts-expect-error testing undefined input path
    expect(escapeHtml(undefined)).toBe('');
  });
});
