import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';
import { EventProvider } from './context/event-context.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider>
      <EventProvider initialDate={new Date()} initialView="month">
        <App />
      </EventProvider>
    </ChakraProvider>
  </React.StrictMode>
);
