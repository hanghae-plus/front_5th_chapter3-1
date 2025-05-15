import { Heading, VStack } from '@chakra-ui/react';

import DateNavigator from './DateNavigator';
import MonthView from './MonthView';
import WeekView from './WeekView';
import { Event } from '../../types';

interface CalendarProps {
  view: 'week' | 'month';
  // eslint-disable-next-line no-unused-vars
  setView: (view: 'week' | 'month') => void;
  currentDate: Date;
  // eslint-disable-next-line no-unused-vars
  navigate: (direction: 'prev' | 'next') => void;
  filteredEvents: Event[];
  notifiedEvents: string[];
  holidays: Record<string, string>;
}

const Calendar = ({
  view,
  setView,
  currentDate,
  navigate,
  filteredEvents,
  notifiedEvents,
  holidays,
}: CalendarProps) => {
  return (
    <VStack flex={1} spacing={5} align="stretch">
      <Heading>일정 보기</Heading>

      <DateNavigator view={view} setView={setView} navigate={navigate} />

      {view === 'week' && (
        <WeekView
          currentDate={currentDate}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
        />
      )}
      {view === 'month' && (
        <MonthView
          currentDate={currentDate}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          holidays={holidays}
        />
      )}
    </VStack>
  );
};

export default Calendar;
