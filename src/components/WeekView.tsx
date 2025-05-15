import { Heading, Table, Tbody, Td, Text, Th, Thead, Tr, VStack } from '@chakra-ui/react';

import { formatWeek, getWeekDates } from '../utils/dateUtils';
import EventItem from './EventItem';

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

function WeekView({ currentDate, events, notifiedEvents }) {
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
                    <EventItem
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
}

export default WeekView;
