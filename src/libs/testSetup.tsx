import { ChakraProvider } from '@chakra-ui/react';
import { render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ReactElement } from 'react';
import { vi } from 'vitest';

export const setup = (element: ReactElement) => {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user };
};
