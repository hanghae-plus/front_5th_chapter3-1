import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';

import { handlers } from './__mocks__/handlers';

/* msw */
export const server = setupServer(...handlers);

// 테스트 환경의 시간대를 UTC로 설정
// 왜 이 시간을 설정해주는 걸까요?
// -> 테스트를 실행하는 환경마다 시간대가 달라질 수 있기 때문에 UTC로 고정함으로써 테스트가 어디서 실행되든 동일한 시간 계산 결과를 보장하기 위함
vi.stubEnv('TZ', 'UTC');

beforeAll(() => {
  server.listen();
  // Vitest의 가짜 타이머 설정
  // 실제 시간 대신 가상의 시간을 사용하여 테스트가 시스템 시간에 의존하지 않게 하기 위함
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

beforeEach(() => {
  expect.hasAssertions();
  // 시스템 시간을 2025년 10월 1일로 고정
  // -> 모든 테스트가 항상 같은 날짜에서 시작하도록 하기 위함
  vi.setSystemTime(new Date('2025-10-01'));
});

afterEach(() => {
  server.resetHandlers();
  // 각 테스트 후 모의 함수의 상태를 초기화
  vi.clearAllMocks();
});

afterAll(() => {
  // 각 테스트 후 모의 함수의 상태를 초기화
  vi.resetAllMocks();
  vi.useRealTimers();
  server.close();
});
