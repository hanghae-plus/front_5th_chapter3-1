import { setupServer, SetupServerApi } from 'msw/node';
import '@testing-library/jest-dom';

import { createHandlers } from './__mocks__/handlers';
import { createMockHandlersUtils } from './__mocks__/handlersUtils';
import { events } from './__mocks__/response/events.json' assert { type: 'json' };
import { Event } from './types';

let server: SetupServerApi;
let mockUtils;

beforeEach(() => {
  expect.hasAssertions();
  mockUtils = createMockHandlersUtils(events as Event[]);
  // 각 테스트마다 새 handlers를 만들어 서버에 등록
  server = setupServer(...createHandlers(mockUtils));
  server.listen();
});

afterEach(() => {
  server.close();
  vi.clearAllMocks();
});

afterAll(() => {
  vi.resetAllMocks();
});
