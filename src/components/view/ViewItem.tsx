import { BellIcon } from '@chakra-ui/icons';
import { Box, Text, HStack } from '@chakra-ui/react';

import { Event } from '../../types';

interface ViewItemProps {
  event: Event;
  isNotified: boolean;
}

export const ViewItem = ({ event, isNotified }: ViewItemProps) => {
  return (
    <Box
      key={event.id}
      data-testid={`event-view-item`}
      p={1}
      my={1}
      bg={isNotified ? 'red.100' : 'gray.100'}
      borderRadius="md"
      fontWeight={isNotified ? 'bold' : 'normal'}
      color={isNotified ? 'red.500' : 'inherit'}
    >
      <HStack spacing={1}>
        {isNotified && <BellIcon />}
        <Text fontSize="sm" noOfLines={1}>
          {event.title}
        </Text>
      </HStack>
    </Box>
  );
};
