import { Box, Flex } from '@chakra-ui/react';
import React, { ReactNode } from 'react';

interface AppLayoutProps {
  eventFormSection: ReactNode;
  calendarViewSection: ReactNode;
  eventListSection: ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  eventFormSection,
  calendarViewSection,
  eventListSection,
}) => {
  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        {eventFormSection}

        {calendarViewSection}

        {eventListSection}
      </Flex>
    </Box>
  );
};
