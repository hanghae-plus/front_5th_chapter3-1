import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from '@/App';
import { RootProvider } from '@/app/providers/RootProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider>
      <RootProvider>
        <App />
      </RootProvider>
    </ChakraProvider>
  </React.StrictMode>
);
