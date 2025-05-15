import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';
import { CalendarProvider } from './context/CalendarContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CalendarProvider>
      <ChakraProvider>
        <App />
      </ChakraProvider>
    </CalendarProvider>
  </React.StrictMode>
);
