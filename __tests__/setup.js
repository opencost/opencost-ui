import '@testing-library/jest-dom';
import 'vitest-axe/extend-expect';

import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';

import { server } from './server.js';

// recharts measures its container through ResizeObserver, which jsdom does not
// implement. Without this stub every chart render throws.
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Material-UI v4's useMediaQuery calls matchMedia unconditionally, and jsdom
// does not provide it.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false;
    },
  });
}

// 'error' rather than 'bypass': an unhandled request in a test is a bug in the
// test, and letting it fall through to a real network call makes the suite
// depend on whatever is listening on localhost. The request:unhandled listener
// in server.js names the offending URL when this fires.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => server.close());
