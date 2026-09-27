import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConfigSettings } from '@/components/config';
import { LanguageProvider } from '@/contexts/LanguageContext';

describe('ConfigSettings Component', () => {
  const defaultProps = {
    baseDir: 'C:/Users/Test/Downloads',
    setBaseDir: vi.fn(),
    onPickDirectory: vi.fn(),
    editor: 'vscode',
    onChangeEditor: vi.fn(),
    fontSize: 'default',
    onChangeFontSize: vi.fn(),
    saving: false,
    lastSavedLabel: 'Saved',
    backgroundImage: null,
    onPickBackgroundImage: vi.fn(),
    onRemoveBackgroundImage: vi.fn(),
    bgSidebar: false,
    setBgSidebar: vi.fn(),
    bgOpacity: 60,
    setBgOpacity: vi.fn(),
    bgBlur: 4,
    setBgBlur: vi.fn(),
    updateStatus: { status: 'idle' as const },
    onCheckUpdate: vi.fn(),
    onQuitAndInstall: vi.fn(),
    onDownloadUpdate: vi.fn(),
    onTestUpdatePopup: vi.fn(),
  };

  it('renders all modular settings sections correctly', () => {
    render(
      <LanguageProvider defaultLanguage="en">
        <ConfigSettings {...defaultProps} />
      </LanguageProvider>
    );

    // Verify Base Directory input is rendered
    expect(screen.getByDisplayValue('C:/Users/Test/Downloads')).toBeInTheDocument();

    // Verify Editor buttons are rendered
    expect(screen.getByText('VS Code')).toBeInTheDocument();
    expect(screen.getByText('Cursor')).toBeInTheDocument();
    expect(screen.getByText('Windsurf')).toBeInTheDocument();
    expect(screen.getByText('Antigravity IDE')).toBeInTheDocument();
  });
});
