import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';

import { handlers, resetMockEvents } from './__mocks__/handlers';

/* msw */
export const server = setupServer(...handlers);

beforeAll(() => {
  server.listen();
});

beforeEach(() => {
  expect.hasAssertions();
  resetMockEvents();
});

afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

afterAll(() => {
  vi.resetAllMocks();
  server.close();
});
