import { Text } from '@chakra-ui/react';
import React from 'react';

export const HolidayText = ({ children }: { children: React.ReactNode }) => {
  return (
    <Text color="red.500" fontSize="sm">
      {children}
    </Text>
  );
};
