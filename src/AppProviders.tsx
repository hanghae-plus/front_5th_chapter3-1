import { ChakraProvider } from '@chakra-ui/react';
import { ReactNode } from 'react';

import { EventProvider } from './contexts/EventContext';
import { EventFormProvider } from './contexts/EventFormContext';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ChakraProvider>
      <EventProvider>
        <EventFormProvider>{children}</EventFormProvider>
      </EventProvider>
    </ChakraProvider>
  );
}
