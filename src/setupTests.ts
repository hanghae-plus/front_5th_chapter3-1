import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';

import { handlers } from './__mocks__/handlers';
import { setupMockHandlerCreation } from './__mocks__/handlersUtils';
import { events } from './__mocks__/response/events.json' assert { type: 'json' };
import { Event } from './entities/event';

/* msw */
export const server = setupServer(...handlers);

beforeAll(() => {
  server.listen();
});

beforeEach(() => {
  setupMockHandlerCreation(events as Event[]);
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
