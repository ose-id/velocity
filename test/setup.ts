import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Automatically clean up DOM after each test
afterEach(() => {
  cleanup();
});
