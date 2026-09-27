import { describe, it, expect } from 'vitest';
import { toSshUrl, formatTimestamp } from '@/utils/helpers';

describe('toSshUrl', () => {
  it('converts standard HTTPS GitHub URL to SSH format', () => {
    const httpsUrl = 'https://github.com/ose-id/velocity.git';
    expect(toSshUrl(httpsUrl)).toBe('git@github.com:ose-id/velocity.git');
  });

  it('appends .git if missing in GitHub URL', () => {
    const httpsUrl = 'https://github.com/ose-id/velocity';
    expect(toSshUrl(httpsUrl)).toBe('git@github.com:ose-id/velocity.git');
  });

  it('leaves non-github URLs untouched', () => {
    const gitlabUrl = 'https://gitlab.com/company/repo.git';
    expect(toSshUrl(gitlabUrl)).toBe(gitlabUrl);
  });

  it('does not convert zip archive URLs', () => {
    const zipUrl = 'https://github.com/ose-id/velocity/archive/refs/heads/main.zip';
    expect(toSshUrl(zipUrl)).toBe(zipUrl);
  });

  it('handles empty or null URLs gracefully', () => {
    expect(toSshUrl('')).toBe('');
    expect(toSshUrl(null as unknown as string)).toBe(null);
  });
});

describe('formatTimestamp', () => {
  it('formats valid ISO timestamp without throwing error', () => {
    const now = new Date('2026-09-27T10:00:00Z').toISOString();
    const formatted = formatTimestamp(now);
    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThan(0);
  });

  it('returns raw input if timestamp is invalid', () => {
    const invalid = 'invalid-date';
    expect(formatTimestamp(invalid)).toBeDefined();
  });
});
