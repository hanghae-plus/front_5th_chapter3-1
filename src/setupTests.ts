import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';

import { handlers } from './__mocks__/handlers';

// timezone 설정
vi.stubEnv('TZ', 'UTC');

/* msw */
export const server = setupServer(...handlers);

beforeAll(() => {
  server.listen();
  vi.useFakeTimers({
    shouldAdvanceTime: true,
    toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'],
  });
});

beforeEach(() => {
  expect.hasAssertions();
  vi.setSystemTime(new Date('2025-10-01'));
});

afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

afterAll(() => {
  vi.resetAllMocks();
  vi.useRealTimers();
  server.close();
});
