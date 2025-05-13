import { Heading, VStack } from '@chakra-ui/react';

import { Event } from '../../../entities/event/model/types';
import { CalendarHeader } from '../../../features/calendar-header/ui/CalendarHeader';
import { MonthView } from '../../../features/month-view/ui/MonthView';
import { WeekView } from '../../../features/week-view/ui/WeekView';

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

interface CalendarWidgetProps {
  filteredEvents: Event[];
  notifiedEvents: string[];
  view: 'week' | 'month';
  currentDate: Date;
  holidays: Record<string, string>;
  setView: (view: 'week' | 'month') => void;
  navigate: (direction: 'prev' | 'next') => void;
}

export const CalendarWidget = ({
  filteredEvents,
  notifiedEvents,
  view,
  currentDate,
  holidays,
  setView,
  navigate,
}: CalendarWidgetProps) => {
  return (
    <VStack flex={1} spacing={5} align="stretch">
      <Heading>일정 보기</Heading>

      <CalendarHeader view={view} setView={setView} navigate={navigate} />

      {view === 'week' && (
        <WeekView
          currentDate={currentDate}
          weekDays={weekDays}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
        />
      )}
      {view === 'month' && (
        <MonthView
          currentDate={currentDate}
          weekDays={weekDays}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          holidays={holidays}
        />
      )}
    </VStack>
  );
};
