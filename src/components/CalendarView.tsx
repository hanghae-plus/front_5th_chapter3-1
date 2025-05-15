import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import {
  Heading,
  HStack,
  IconButton,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  Select,
} from '@chakra-ui/react';

import { useEventRenderer } from '../hooks/useEventRenderer';
import { Event } from '../types';
import {
  formatDate,
  formatMonth,
  formatWeek,
  getEventsForDay,
  getWeekDates,
  getWeeksAtMonth,
} from '../utils/dateUtils';

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

interface WeekViewProps {
  currentDate: Date;
  filteredEvents: Event[];
  notifiedEvents: string[];
  weekDays: string[];
}

const WeekView = ({ currentDate, filteredEvents, notifiedEvents, weekDays }: WeekViewProps) => {
  const weekDates = getWeekDates(currentDate);
  const { renderEvent } = useEventRenderer({ events: filteredEvents, notifiedEvents });

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
                  .map(renderEvent)}
              </Td>
            ))}
          </Tr>
        </Tbody>
      </Table>
    </VStack>
  );
};

interface MonthViewProps {
  currentDate: Date;
  filteredEvents: Event[];
  notifiedEvents: string[];
  weekDays: string[];
  holidays: Record<string, string>;
}

const MonthView = ({
  currentDate,
  filteredEvents,
  notifiedEvents,
  weekDays,
  holidays,
}: MonthViewProps) => {
  const weeks = getWeeksAtMonth(currentDate);
  const { renderEvent } = useEventRenderer({ events: filteredEvents, notifiedEvents });

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
                        {getEventsForDay(filteredEvents, day).map(renderEvent)}
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

interface CalendarViewProps {
  navigate: (direction: 'prev' | 'next') => void;
  view: 'week' | 'month';
  setView: (view: 'week' | 'month') => void;
  currentDate: Date;
  filteredEvents: Event[];
  notifiedEvents: string[];
  holidays: Record<string, string>;
}

function CalendarView({
  navigate,
  view,
  setView,
  currentDate,
  filteredEvents,
  notifiedEvents,
  holidays,
}: CalendarViewProps) {
  return (
    <VStack flex={1} spacing={5} align="stretch">
      <Heading>일정 보기</Heading>

      <HStack mx="auto" justifyContent="space-between">
        <IconButton
          aria-label="Previous"
          icon={<ChevronLeftIcon />}
          onClick={() => navigate('prev')}
        />
        <Select
          aria-label="view"
          value={view}
          onChange={(e) => setView(e.target.value as 'week' | 'month')}
        >
          <option value="week">Week</option>
          <option value="month">Month</option>
        </Select>
        <IconButton
          aria-label="Next"
          icon={<ChevronRightIcon />}
          onClick={() => navigate('next')}
        />
      </HStack>

      {view === 'week' && (
        <WeekView
          currentDate={currentDate}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          weekDays={weekDays}
        />
      )}
      {view === 'month' && (
        <MonthView
          currentDate={currentDate}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          weekDays={weekDays}
          holidays={holidays}
        />
      )}
    </VStack>
  );
}

export default CalendarView;
