import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';

async function enableMocking() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const { worker } = await import('./__mocks__/browser');

  // `worker.start()` returns a Promise that resolves
  // once the Service Worker is up and ready to intercept requests.
  return worker.start();
}

enableMocking().then(() => {
  const root = createRoot(document.getElementById('root') as HTMLElement);
  root.render(
    <React.StrictMode>
      <ChakraProvider>
        <App />
      </ChakraProvider>
    </React.StrictMode>
  );
});