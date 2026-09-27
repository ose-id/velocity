import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProjectCard from '@/components/home/ProjectCard';
import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import type { ConfigButton } from '@/types';

describe('ProjectCard', () => {
  const mockButton: ConfigButton = {
    id: 'proj-1',
    label: 'Awesome App',
    repoUrl: 'https://github.com/org/awesome-app',
    folderName: 'awesome-app',
    color: 'emerald',
  };

  const renderCard = (props = {}) => {
    return render(
      <DndContext>
        <SortableContext items={['proj-1']}>
          <ProjectCard
            btn={mockButton}
            loading={false}
            activeButtonId={null}
            onClone={vi.fn()}
            {...props}
          />
        </SortableContext>
      </DndContext>
    );
  };

  it('renders project label and folder name correctly', () => {
    renderCard();

    expect(screen.getByText('Awesome App')).toBeInTheDocument();
    expect(screen.getByText('awesome-app')).toBeInTheDocument();
  });

  it('calls onClone when card is clicked in normal mode', () => {
    const handleClone = vi.fn();
    renderCard({ onClone: handleClone });

    const cardButton = screen.getByRole('button', { name: /Awesome App/i });
    fireEvent.click(cardButton);

    expect(handleClone).toHaveBeenCalledTimes(1);
    expect(handleClone).toHaveBeenCalledWith(mockButton);
  });

  it('calls onToggleSelection when clicked in selection mode', () => {
    const handleToggleSelection = vi.fn();
    renderCard({
      isSelectionMode: true,
      onToggleSelection: handleToggleSelection,
    });

    const cardButton = screen.getByRole('button', { name: /Awesome App/i });
    fireEvent.click(cardButton);

    expect(handleToggleSelection).toHaveBeenCalledWith('proj-1');
  });
});
