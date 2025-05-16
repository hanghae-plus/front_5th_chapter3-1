import { Heading, VStack } from '@chakra-ui/react';

import DateNavigator from './DateNavigator';
import MonthView from './MonthView';
import WeekView from './WeekView';
import { useCalendarView } from '../../hooks/useCalendarView';
import { Event } from '../../types';

interface CalendarProps {
  filteredEvents: Event[];
  notifiedEvents: string[];
}

const Calendar = ({ filteredEvents, notifiedEvents }: CalendarProps) => {
  const { view } = useCalendarView();

  return (
    <VStack flex={1} spacing={5} align="stretch">
      <Heading>일정 보기</Heading>

      <DateNavigator />

      {view === 'week' && (
        <WeekView filteredEvents={filteredEvents} notifiedEvents={notifiedEvents} />
      )}
      {view === 'month' && (
        <MonthView filteredEvents={filteredEvents} notifiedEvents={notifiedEvents} />
      )}
    </VStack>
  );
};

export default Calendar;
