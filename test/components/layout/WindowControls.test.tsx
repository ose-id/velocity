import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WindowControls } from '@/components/layout';

describe('WindowControls Component', () => {
  it('renders minimize, maximize, and close buttons', () => {
    const handleControl = vi.fn();
    render(<WindowControls onWindowControl={handleControl} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });

  it('calls minimize when first button clicked', async () => {
    const handleControl = vi.fn();
    render(<WindowControls onWindowControl={handleControl} />);

    const buttons = screen.getAllByRole('button');
    await userEvent.click(buttons[0]);
    expect(handleControl).toHaveBeenCalledWith('minimize');
  });

  it('calls maximize when not maximized and unmaximize when maximized', async () => {
    const handleControl = vi.fn();
    const { rerender } = render(
      <WindowControls onWindowControl={handleControl} windowState={{ isMaximized: false }} />
    );

    const buttons = screen.getAllByRole('button');
    await userEvent.click(buttons[1]);
    expect(handleControl).toHaveBeenCalledWith('maximize');

    rerender(
      <WindowControls onWindowControl={handleControl} windowState={{ isMaximized: true }} />
    );
    const updatedButtons = screen.getAllByRole('button');
    await userEvent.click(updatedButtons[1]);
    expect(handleControl).toHaveBeenCalledWith('unmaximize');
  });

  it('calls close when third button clicked', async () => {
    const handleControl = vi.fn();
    render(<WindowControls onWindowControl={handleControl} />);

    const buttons = screen.getAllByRole('button');
    await userEvent.click(buttons[2]);
    expect(handleControl).toHaveBeenCalledWith('close');
  });
});
