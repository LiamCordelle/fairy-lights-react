import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';


afterEach(() => {
  cleanup();
});

window.matchMedia = window.matchMedia || (() => ({
  matches: false,
  addEventListener: () => {},
  removeEventListener: () => {},
}));

global.ResizeObserver = global.ResizeObserver || class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
