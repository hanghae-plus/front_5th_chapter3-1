import { Heading, VStack } from '@chakra-ui/react';

import CalendarHeader from './CalendarHeader.tsx';
import renderMonthView from './MonthView.tsx';
import renderWeekView from './WeekView.tsx';
import { Event } from '../../types.ts';

interface Props {
  view: 'week' | 'month';
  setView: (v: 'week' | 'month') => void;
  currentDate: Date;
  navigate: (dir: 'prev' | 'next') => void;
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
}: Props) => {
  return (
    <VStack flex={1} spacing={5} align="stretch">
      <Heading>일정 보기</Heading>

      <CalendarHeader view={view} onChangeView={setView} onNavigate={navigate} />

      {view === 'week' && renderWeekView({ filteredEvents, notifiedEvents, currentDate })}
      {view === 'month' &&
        renderMonthView({ filteredEvents, notifiedEvents, currentDate, holidays })}
    </VStack>
  );
};

export default Calendar;
