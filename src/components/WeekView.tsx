import {
  Box,
  VStack,
  HStack,
  Heading,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
} from '@chakra-ui/react';
import { BellIcon } from '@chakra-ui/icons';
import { useCalendarView, useEventOperations, useNotifications, useSearch } from '@/hooks';
import { weekDays } from '@/lib';
import { formatWeek, getWeekDates } from '@/utils';

export function WeekView() {
  const { currentDate, view } = useCalendarView();
  const { events } = useEventOperations(false);
  const weekDates = getWeekDates(currentDate);
  const { filteredEvents } = useSearch(events, currentDate, view);
  const { notifiedEvents } = useNotifications(events);

  return (
    <VStack data-testid="week-view" align="stretch" w="full" spacing={4}>
      <Heading size="md">{formatWeek(currentDate)}</Heading>
      <Table variant="simple" w="full">
        <Thead>
          <Tr>
            {weekDays.map((day) => (
              <Th key={day} width="14.28%">
                {day}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            {weekDates.map((date) => (
              <Td key={date.toISOString()} height="100px" verticalAlign="top" width="14.28%">
                <Text fontWeight="bold">{date.getDate()}</Text>
                {filteredEvents
                  .filter((event) => new Date(event.date).toDateString() === date.toDateString())
                  .map((event) => {
                    const isNotified = notifiedEvents.includes(event.id);
                    return (
                      <Box
                        key={event.id}
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
                  })}
              </Td>
            ))}
          </Tr>
        </Tbody>
      </Table>
    </VStack>
  );
}
