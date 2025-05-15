import { ChakraProvider } from '@chakra-ui/react';
import { Provider } from 'jotai';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';
import { CalendarProvider } from './context/CalendarContext.tsx';
import { EventProvider } from './context/EventContext.tsx';
import { EventOperationProvider } from './context/EventOperationContext.tsx';
import { NotificationProvider } from './context/NotificationContext.tsx';
import { OverlapDialogProvider } from './context/OverlapDialogContext.tsx';
import { SearchProvider } from './context/SearchContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider>
      <CalendarProvider>
        <ChakraProvider>
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
        </ChakraProvider>
      </CalendarProvider>
    </Provider>
  </React.StrictMode>
);
