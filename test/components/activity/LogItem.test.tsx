import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LogItem from '@/components/activity/LogItem';

describe('LogItem', () => {
  it('renders timestamp and message correctly', () => {
    const entry = {
      id: '1',
      timestamp: '2026-09-27T10:00:00.000Z',
      message: '[OK] Cloned repository successfully',
    };

    render(<LogItem entry={entry} />);

    expect(screen.getByText('[OK] Cloned repository successfully')).toBeInTheDocument();
  });
});
