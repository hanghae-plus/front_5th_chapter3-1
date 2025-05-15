import { ChakraProvider } from '@chakra-ui/react';
import { render, RenderResult } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { ReactElement } from 'react';

export const setup = (element: ReactElement): RenderResult & { user: UserEvent } => {
  const user = userEvent.setup();

  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user }; // ? Medium: 여기서 ChakraProvider로 묶어주는 동작은 의미있을까요? 있다면 어떤 의미일까요?
};
