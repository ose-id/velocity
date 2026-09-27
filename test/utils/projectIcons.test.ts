import { describe, it, expect } from 'vitest';
import { getProjectIcon, PROJECT_ICON_MAP } from '@/utils/projectIcons';

describe('getProjectIcon', () => {
  it('returns mapped icon for direct framework matches', () => {
    expect(getProjectIcon('vue')).toBe(PROJECT_ICON_MAP['vue']);
    expect(getProjectIcon('react')).toBe(PROJECT_ICON_MAP['react']);
    expect(getProjectIcon('nuxt')).toBe(PROJECT_ICON_MAP['nuxt']);
    expect(getProjectIcon('electron')).toBe(PROJECT_ICON_MAP['electron']);
  });

  it('handles case-insensitive types', () => {
    expect(getProjectIcon('REACT')).toBe(PROJECT_ICON_MAP['react']);
    expect(getProjectIcon('Nuxt')).toBe(PROJECT_ICON_MAP['nuxt']);
  });

  it('handles aliases', () => {
    expect(getProjectIcon('js')).toBe(PROJECT_ICON_MAP['javascript']);
    expect(getProjectIcon('ts')).toBe(PROJECT_ICON_MAP['typescript']);
    expect(getProjectIcon('py')).toBe(PROJECT_ICON_MAP['python']);
  });

  it('falls back to github default icon when unknown', () => {
    expect(getProjectIcon('unknown-framework-xyz')).toBe(PROJECT_ICON_MAP['github']);
    expect(getProjectIcon('')).toBe(PROJECT_ICON_MAP['github']);
    expect(getProjectIcon(null as unknown as string)).toBe(PROJECT_ICON_MAP['github']);
  });
});
