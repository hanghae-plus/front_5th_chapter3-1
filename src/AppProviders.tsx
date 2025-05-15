import { ChakraProvider } from '@chakra-ui/react';
import { ReactNode } from 'react';

import { EventFormProvider } from './contexts/EventFormContext';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ChakraProvider>
      <EventFormProvider>{children}</EventFormProvider>
    </ChakraProvider>
  );
}
