import { VStack, Heading, Table, Thead, Tbody, Tr, Th, Td, Text } from '@chakra-ui/react';

import { MonthViewEvent } from './MonthViewEvent';
import { MonthViewProps } from './types';
import { weekDays } from '../../../constants';
import {
  formatMonth,
  formatDate,
  getWeeksAtMonth,
  getEventsForDay,
} from '../../../utils/dateUtils';

export const MonthView = ({ currentDate, events, notifiedEvents, holidays }: MonthViewProps) => {
  const weeks = getWeeksAtMonth(currentDate);

  return (
    <VStack data-testid="month-view" align="stretch" w="full" spacing={4}>
      <Heading size="md">{formatMonth(currentDate)}</Heading>
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
                  >
                    {day && (
                      <>
                        <Text fontWeight="bold">{day}</Text>
                        {holiday && (
                          <Text color="red.500" fontSize="sm">
                            {holiday}
                          </Text>
                        )}
                        {getEventsForDay(events, day).map((event) => (
                          <MonthViewEvent
                            key={event.id}
                            event={event}
                            isNotified={notifiedEvents.includes(event.id)}
                          />
                        ))}
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
