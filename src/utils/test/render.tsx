import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';

export default async (
  component: React.ReactNode
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
