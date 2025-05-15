import { ChakraProvider } from '@chakra-ui/react';
import { ReactNode } from 'react';

import { EventProvider } from '@/entities/event/model/EventProvider';

export const RootProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ChakraProvider>
      <EventProvider>{children}</EventProvider>
    </ChakraProvider>
  );
};
