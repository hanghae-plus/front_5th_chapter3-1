import { Heading, VStack } from '@chakra-ui/react';

import CalendarHeader from './CalendarHeader.tsx';
import CalendarView from './CalendarView.tsx';
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

      <CalendarView
        view={view}
        currentDate={currentDate}
        holidays={holidays}
        filteredEvents={filteredEvents}
        notifiedEvents={notifiedEvents}
      />
    </VStack>
  );
};

export default Calendar;
