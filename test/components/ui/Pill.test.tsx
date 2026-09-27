import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Pill } from '@/components/ui';

describe('Pill Component', () => {
  it('renders the label correctly', () => {
    render(<Pill label="my-folder" className="test-class" />);
    expect(screen.getByText('my-folder')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Pill label="custom" className="bg-emerald-500" />);
    const pillElement = container.firstChild;
    expect(pillElement).toHaveClass('bg-emerald-500');
  });
});
