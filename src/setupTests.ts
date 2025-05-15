import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';

import { handlers } from './__mocks__/handlers';

/* msw */
export const server = setupServer(...handlers);

beforeAll(() => {
  server.listen();

  // ✅ 날짜를 2025년 10월 1일로 고정
  //   vi.useFakeTimers();
  //   vi.setSystemTime(new Date('2025-10-01'));
});

beforeEach(() => {
  expect.hasAssertions();
});

afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

afterAll(() => {
  vi.resetAllMocks();
  server.close();

  // ✅ 타이머 복원
  // vi.useRealTimers();
  // vi.resetAllMocks();
});
