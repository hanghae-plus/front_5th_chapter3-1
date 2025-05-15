import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { HStack, Heading, IconButton, Select, VStack } from '@chakra-ui/react';

import { Event } from '../types';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { useCalendarView } from '../hooks/useCalendarView';
import { useNotifications } from '../hooks/useNotifications';

interface CalendarViewProps {
  // view: 'week' | 'month';
  // currentDate: Date;
  events: Event[];
  // holidays: Record<string, string>;
  // navigate: (direction: 'prev' | 'next') => void;
  // setView: (view: 'week' | 'month') => void;
}

export const CalendarView = ({ events }: CalendarViewProps) => {
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { notifiedEvents } = useNotifications(events);
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
        <WeekView currentDate={currentDate} events={events} notifiedEvents={notifiedEvents} />
      )}
      {view === 'month' && (
        <MonthView
          currentDate={currentDate}
          events={events}
          notifiedEvents={notifiedEvents}
          holidays={holidays}
        />
      )}
    </VStack>
  );
};
