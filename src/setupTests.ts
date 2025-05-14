import '@testing-library/jest-dom';
import { setupServer } from 'msw/node';

import { handlers } from './__mocks__/handlers';

/* msw */
export const server = setupServer(...handlers);

//mock 서버를 시작해 테스트 중의 네트워크 요청을 가로챔
beforeAll(() => {
  server.listen();
});

//expect.hasAssertions()는 테스트 내에서 expect()를 최소 1번 이상 호출했는지 검사
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
