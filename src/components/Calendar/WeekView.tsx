import { VStack, Heading, Table, Thead, Tbody, Tr, Th, Td, Text } from '@chakra-ui/react';

import { WeekViewProps } from './types';
import { WeekViewEvent } from './WeekViewEvent';
import { weekDays } from '../../constants';
import { getWeekDates, formatWeek } from '../../utils/dateUtils';

export const WeekView = ({ currentDate, events, notifiedEvents }: WeekViewProps) => {
  const weekDates = getWeekDates(currentDate);

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
                {events
                  .filter((event) => new Date(event.date).toDateString() === date.toDateString())
                  .map((event) => (
                    <WeekViewEvent
                      key={event.id}
                      event={event}
                      isNotified={notifiedEvents.includes(event.id)}
                    />
                  ))}
              </Td>
            ))}
          </Tr>
        </Tbody>
      </Table>
    </VStack>
  );
};
