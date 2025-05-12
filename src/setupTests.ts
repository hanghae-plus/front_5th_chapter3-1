import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';

import { handlers } from './__mocks__/handlers';

/* msw */
export const server = setupServer(...handlers);

beforeAll(() => {
  server.listen();
});

beforeEach(() => {
  expect.hasAssertions();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-10-01'));
});

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers(); // <- 타이머 원복도 반드시 필요
  server.resetHandlers();
});

afterAll(() => {
  vi.resetAllMocks();
  server.close();
});
