import { BellIcon } from '@chakra-ui/icons';
import {
  Box,
  Heading,
  HStack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from '@chakra-ui/react';

import { Event } from '../../../entities/event/model/types';
import {
  formatMonth,
  formatDate,
  getWeeksAtMonth,
  getEventsForDay,
} from '../../../shared/lib/dateUtils';
// import { useMonthCalendarMatrix } from '../model/useMonthCalendarMatrix';

interface Props {
  currentDate: Date;
  filteredEvents: Event[];
  // eslint-disable-next-line no-unused-vars
  isNotified: (event: Event) => boolean;
  holidays: { [key: string]: string };
}
const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
export function MonthView({ currentDate, filteredEvents, isNotified, holidays }: Props) {
  const weeks = getWeeksAtMonth(currentDate);
  // const calendarMatrix = useMonthCalendarMatrix(currentDate, holidays);

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
                        {getEventsForDay(filteredEvents, day).map((event) => {
                          // const isNotified = notifiedEvents.includes(event.id);
                          return (
                            <Box
                              key={event.id}
                              p={1}
                              my={1}
                              bg={isNotified(event) ? 'red.100' : 'gray.100'}
                              borderRadius="md"
                              fontWeight={isNotified(event) ? 'bold' : 'normal'}
                              color={isNotified(event) ? 'red.500' : 'inherit'}
                            >
                              <HStack spacing={1}>
                                {isNotified(event) && <BellIcon />}
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
}
