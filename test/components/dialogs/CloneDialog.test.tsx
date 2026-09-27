import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CloneDialog from '@/components/dialogs/CloneDialog';
import { LanguageProvider } from '@/contexts/LanguageContext';

describe('CloneDialog', () => {
  const mockButton = {
    id: 1,
    label: 'Test Project',
    repoUrl: 'https://github.com/test/repo.git',
    folderName: 'test-repo',
  };

  it('does not render when open is false', () => {
    const { container } = render(
      <LanguageProvider>
        <CloneDialog
          open={false}
          button={mockButton}
          onClose={() => {}}
          onCloneGit={() => {}}
          onDownloadZip={() => {}}
        />
      </LanguageProvider>
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders repo details and triggers clone when button is clicked', () => {
    const handleCloneGit = vi.fn();
    const handleClose = vi.fn();

    render(
      <LanguageProvider>
        <CloneDialog
          open={true}
          button={mockButton}
          onClose={handleClose}
          onCloneGit={handleCloneGit}
          onDownloadZip={() => {}}
        />
      </LanguageProvider>
    );

    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText(/Clone options/i)).toBeInTheDocument();

    const cloneButton = screen.getByRole('button', { name: /clone via git/i });
    fireEvent.click(cloneButton);

    expect(handleCloneGit).toHaveBeenCalledTimes(1);
    expect(handleCloneGit).toHaveBeenCalledWith(
      mockButton,
      expect.objectContaining({
        deleteGit: false,
        useSsh: false,
      })
    );
  });
});
