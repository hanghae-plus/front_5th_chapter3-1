import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { ReactNode } from 'react';

export default async (
  component: ReactNode
): Promise<{
  user: ReturnType<typeof userEvent.setup>;
  [key: string]: any;
}> => {
  const user = userEvent.setup();

  return {
    user,
    ...render(<ChakraProvider>{component}</ChakraProvider>),
  };
};
