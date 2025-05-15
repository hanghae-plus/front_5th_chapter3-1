import { BellIcon } from '@chakra-ui/icons';
import {
  VStack,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Box,
  HStack,
} from '@chakra-ui/react';
import React from 'react';

import { Event } from '../types'; // Assuming Event type is in ../types

interface MonthViewProps {
  currentDate: Date;
  holidays: Record<string, string>;
  filteredEvents: Event[];
  notifiedEvents: string[]; // Array of event IDs
  WEEK_DAYS: readonly string[];
  formatMonth: (_date: Date) => string;
  getWeeksAtMonth: (_date: Date) => (number | null)[][];
  formatDate: (_currentDate: Date, _day: number) => string;
  getEventsForDay: (_events: Event[], _day: number) => Event[];
}

export const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  holidays,
  filteredEvents,
  notifiedEvents,
  WEEK_DAYS,
  formatMonth,
  getWeeksAtMonth,
  formatDate,
  getEventsForDay,
}) => {
  const weeks = getWeeksAtMonth(currentDate);

  return (
    <VStack data-testid="month-view" align="stretch" w="full" spacing={4}>
      <Heading size="md">{formatMonth(currentDate)}</Heading>
      <Table variant="simple" w="full">
        <Thead>
          <Tr>
            {WEEK_DAYS.map((day) => (
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
                        {getEventsForDay(filteredEvents, day).map((event) => {
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
                                {isNotified && <BellIcon aria-label="bell icon" />}
                                <Text fontSize="sm" noOfLines={1}>
                                  {event.title}
                                </Text>
                              </HStack>
                            </Box>
                          );
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
