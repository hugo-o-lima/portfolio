import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom has no IntersectionObserver; Reveal (scroll-reveal) relies on it.
// Assign it directly on globalThis (not via vi.stubGlobal) so per-test
// vi.unstubAllGlobals() calls don't strip it away. It immediately reports the
// element as intersecting so revealed content renders synchronously.
class MockIntersectionObserver {
  constructor(private callback: IntersectionObserverCallback) {}
  observe(el: Element) {
    this.callback(
      [{ isIntersecting: true, target: el } as unknown as IntersectionObserverEntry],
      this as unknown as IntersectionObserver
    );
  }
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

afterEach(() => {
  cleanup();
});
