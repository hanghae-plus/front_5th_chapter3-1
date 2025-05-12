import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';
import { Event } from './types';

async function prepare() {
  const { setupWorker } = await import('msw/browser');
  const { createMockHandlersUtils } = await import('./__mocks__/handlersUtils');
  const { createHandlers } = await import('./__mocks__/handlers');
  const { events } = await import('./__mocks__/response/events.json');
  const mockUtils = createMockHandlersUtils(events as Event[]);
  const handlers = createHandlers(mockUtils);
  const worker = setupWorker(...handlers);
  return worker.start();
}

prepare().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ChakraProvider>
        <App />
      </ChakraProvider>
    </React.StrictMode>
  );
});
