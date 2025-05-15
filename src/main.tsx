import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';
import {
  CalendarProvider,
  EventProvider,
  EventOperationProvider,
  NotificationProvider,
  OverlapDialogProvider,
  SearchProvider,
} from './context';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider>
      <CalendarProvider>
        <OverlapDialogProvider>
          <EventProvider>
            <EventOperationProvider>
              <NotificationProvider>
                <SearchProvider>
                  <App />
                </SearchProvider>
              </NotificationProvider>
            </EventOperationProvider>
          </EventProvider>
        </OverlapDialogProvider>
      </CalendarProvider>
    </ChakraProvider>
  </React.StrictMode>
);
