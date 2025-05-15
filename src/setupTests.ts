import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';

import { handlers } from './__mocks__/handlers';

/* msw */
// 시간을 고정하는 이유:
// 1. 테스트의 일관성을 보장하기 위함입니다. 테스트는 실행 시점에 관계없이 항상 동일한 결과를 반환
// 2. 달력, 일정 등 날짜/시간에 의존적인 컴포넌트를 테스트할 때 특히 중요
// 3. 날짜를 2025-10-01로 고정함으로써 월별 뷰, 주별 뷰 등에서 표시되는 날짜와 일정이
//    테스트 실행 시점과 관계없이 항상 일관되게 표시
// 4. 시간에 영향을 받는 기능(알림, 일정 충돌 등)을 예측 가능하게 테스트가능s
export const server = setupServer(...handlers);

vi.stubEnv('TZ', 'UTC');

beforeAll(() => {
  server.listen();
  vi.useFakeTimers({ shouldAdvanceTime: true });
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
