import { Heading, Table, Tbody, Td, Text, Tr, VStack } from '@chakra-ui/react';

import { ViewHeader } from './ViewHeader';
import { ViewItem } from './ViewItem';
import { Event } from '../../types';
import { formatDate, formatMonth, getEventsForDay, getWeeksAtMonth } from '../../utils/dateUtils';

interface MonthViewProps {
  currentDate: Date;
  filteredEvents: Event[];
  notifiedEvents: string[];
  holidays: Record<string, string>;
}

export const MonthView = ({
  currentDate,
  filteredEvents,
  notifiedEvents,
  holidays,
}: MonthViewProps) => {
  const weeks = getWeeksAtMonth(currentDate);

  return (
    <VStack data-testid="month-view" align="stretch" w="full" spacing={4}>
      <Heading size="md">{formatMonth(currentDate)}</Heading>
      <Table variant="simple" w="full">
        <ViewHeader />
        <Tbody>
          {weeks.map((week, weekIndex) => (
            <Tr key={weekIndex}>
              {week.map((day, dayIndex) => {
                const dateString = day ? formatDate(currentDate, day) : '';
                const holiday = holidays[dateString];

                return (
                  <Td
                    key={dayIndex}
                    height="100px"
                    verticalAlign="top"
                    width="14.28%"
                    position="relative"
                    data-testid="month-view-td"
                  >
                    {day && (
                      <>
                        <Text fontWeight="bold">{day}</Text>
                        {holiday && (
                          <Text color="red.500" fontSize="sm">
                            {holiday}
                          </Text>
                        )}
                        {getEventsForDay(filteredEvents, day).map((event) => {
                          const isNotified = notifiedEvents.includes(event.id);
                          return <ViewItem key={event.id} event={event} isNotified={isNotified} />;
                        })}
                      </>
                    )}
                  </Td>
                );
              })}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </VStack>
  );
};
