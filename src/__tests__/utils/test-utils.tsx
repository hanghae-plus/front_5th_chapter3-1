import { ChakraProvider } from '@chakra-ui/react';
import { render, RenderResult } from '@testing-library/react';
import { ReactElement } from 'react';

// ChakraProvider를 포함한 커스텀 렌더 함수
export const renderWithChakra = (ui: ReactElement): RenderResult => {
  return render(ui, {
    wrapper: ({ children }) => <ChakraProvider>{children}</ChakraProvider>,
  });
};
