import { Heading, Table, Tbody, Td, Text, Th, Thead, Tr, VStack } from '@chakra-ui/react';
import { FC } from 'react';

import { Event } from '../types';
import { formatDate, formatMonth, getEventsForDay, getWeeksAtMonth } from '../utils/dateUtils';
// eslint-disable-next-line import/order
import EventItem from './EventItem';

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

type MonthViewProps = {
  currentDate: Date;
  events: Event[];
  holidays: { [key: string]: string };
  notifiedEvents: string[];
};

const MonthView: FC<MonthViewProps> = ({ currentDate, events, holidays, notifiedEvents }) => {
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
                const dayEvents = day ? getEventsForDay(events, day) : [];

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
                        {dayEvents.map((event) => (
                          <EventItem
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

export default MonthView;
