import { Heading, Table, Tbody, Td, Text, Th, Thead, Tr, VStack } from '@chakra-ui/react';

import { EventBox } from './EventBox';
import { HolidayText } from './HolidayText';
import { weekDays } from '../../../based/constants';
import {
  getWeeksAtMonth,
  formatDate,
  formatMonth,
  getEventsForDay,
} from '../../../based/utils/dateUtils';
import { Event } from '../../../types';

export const MonthView = ({
  currentDate,
  holidays,
  filteredEvents,
  notifiedEvents,
}: {
  currentDate: Date;
  holidays: Record<string, string>;
  filteredEvents: Event[];
  notifiedEvents: string[];
}) => {
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
                        {holiday && <HolidayText>{holiday}</HolidayText>}
                        {getEventsForDay(filteredEvents, day).map((event) => {
                          const isNotified = notifiedEvents.includes(event.id);
                          return <EventBox key={event.id} event={event} isNotified={isNotified} />;
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
