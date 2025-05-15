import { ChakraProvider } from '@chakra-ui/react';
import { render, RenderOptions } from '@testing-library/react';
import React, { ReactElement } from 'react';

const AllTheProviders = ({ children }: { children: ReactElement }) => {
  return <ChakraProvider>{children}</ChakraProvider>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): ReturnType<typeof render> =>
  render(ui, { wrapper: AllTheProviders as React.ComponentType, ...options });

export * from '@testing-library/react';
export { customRender as render };
