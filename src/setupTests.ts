import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';

import { handlers } from './__mocks__/handlers';
import { setupMockHandlerCreation } from './__mocks__/handlersUtils';
import { events } from './__mocks__/response/events.json' assert { type: 'json' };
import { Event } from './types';

/* msw */
export const server = setupServer(...handlers);

beforeAll(() => {
  server.listen();
});

beforeEach(() => {
  expect.hasAssertions();
  // 각 테스트 전에 이벤트 데이터 초기화
  setupMockHandlerCreation(events as Event[]);
});

afterEach(() => {
  // server.resetHandlers() 제거
  vi.clearAllMocks();
});

afterAll(() => {
  vi.resetAllMocks();
  server.close();
});
