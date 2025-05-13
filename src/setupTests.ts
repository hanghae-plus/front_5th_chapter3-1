import '@testing-library/jest-dom';
import { setupServer } from 'msw/node';

import { handlers } from './__mocks__/handlers';

/* msw */
export const server = setupServer(...handlers);

vi.stubEnv('TZ', 'UTC'); // 타임존 문제 전체 처리

beforeAll(() => {
  server.listen();
  vi.useFakeTimers(); // useCalendarView 테스트 시 2025-10-01 고정
});

beforeEach(() => {
  expect.hasAssertions(); // 테스트가 적어도 하나 있어야 한다. expect
  const fake = new Date('2025-10-01');
  vi.setSystemTime(fake);
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
