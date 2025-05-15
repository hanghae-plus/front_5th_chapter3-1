import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';
import { EventFormProvider } from './contexts/EventFormContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider>
      <EventFormProvider>
        <App />
      </EventFormProvider>
    </ChakraProvider>
  </React.StrictMode>
);
