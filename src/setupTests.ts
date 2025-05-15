import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';

import { handlers } from './__mocks__/handlers';

// React를 개발 모드로 설정
// hooks 테스트에서 act(...) is not supported in production builds of React. 오류 발생
// 개발 모드가 아닌 프로덕트 모드에서는 테스트 코드가 작동하지 않음
process.env.NODE_ENV = 'development';

/* msw */
export const server = setupServer(...handlers);

beforeAll(() => {
  server.listen();
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
});
