import { ChakraProvider } from '@chakra-ui/react';
import { Provider } from 'jotai';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';
import { EventProvider } from './context/EventContext.tsx';
import { EventOperationProvider } from './context/EventOperationContext.tsx';
import { NotificationProvider } from './context/NotificationContext.tsx';
import { OverlapDialogProvider } from './context/OverlapDialogContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider>
      <ChakraProvider>
        <OverlapDialogProvider>
          <EventProvider>
            <EventOperationProvider>
              <NotificationProvider>
                <App />
              </NotificationProvider>
            </EventOperationProvider>
          </EventProvider>
        </OverlapDialogProvider>
      </ChakraProvider>
    </Provider>
  </React.StrictMode>
);
