import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';

import { createHandlers } from './__mocks__/handlers';
import { createMockHandlersUtils } from './__mocks__/handlersUtils';
import { events } from './__mocks__/response/events.json' assert { type: 'json' };
import { Event } from './types';
import { cleanup } from '@testing-library/react';

const server = setupServer();
export { server };

let mockUtils: ReturnType<typeof createMockHandlersUtils>;

beforeAll(() => {
  // 테스트 환경에서 MSW 서버를 시작
  server.listen();
});

beforeEach(() => {
  // 테스트 내에 expect가 실행되지 않으면 fail시키는 메서드
  expect.hasAssertions();
  // 각 테스트마다 mockUtils와 핸들러를 새로 생성
  mockUtils = createMockHandlersUtils(events as Event[]);
  server.resetHandlers(...createHandlers(mockUtils));
});

afterEach(() => {
  server.resetHandlers();
  // mock 함수의 .mock.calls, .mock.instances 등 호출 이력만 리셋
  vi.clearAllMocks();

  // mock으로 global한 Date 변경했는데 복원하는 메서드
  vi.restoreAllMocks();
});

afterAll(() => {
  server.close();
  vi.resetAllMocks();
});
