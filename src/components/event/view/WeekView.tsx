import { Heading, Table, Tbody, Td, Text, Tr, VStack } from '@chakra-ui/react';

import { ViewHeader } from './ViewHeader';
import { ViewItem } from './ViewItem';
import { Event } from '../../../types';
import { formatWeek, getWeekDates } from '../../../utils/dateUtils';

interface WeekViewProps {
  currentDate: Date;
  filteredEvents: Event[];
  notifiedEvents: string[];
}

export const WeekView = ({ currentDate, filteredEvents, notifiedEvents }: WeekViewProps) => {
  const weekDates = getWeekDates(currentDate);

  return (
    <VStack data-testid="week-view" align="stretch" w="full" spacing={4}>
      <Heading size="md">{formatWeek(currentDate)}</Heading>
      <Table variant="simple" w="full">
        <ViewHeader />
        <Tbody>
          <Tr>
            {weekDates.map((date) => (
              <Td key={date.toISOString()} height="100px" verticalAlign="top" width="14.28%">
                <Text fontWeight="bold">{date.getDate()}</Text>
                {filteredEvents
                  .filter((event) => new Date(event.date).toDateString() === date.toDateString())
                  .map((event) => {
                    const isNotified = notifiedEvents.includes(event.id);
                    return <ViewItem key={event.id} event={event} isNotified={isNotified} />;
                  })}
              </Td>
            ))}
          </Tr>
        </Tbody>
      </Table>
    </VStack>
  );
};
