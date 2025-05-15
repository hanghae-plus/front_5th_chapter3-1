import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { Heading, HStack, IconButton, Select, VStack } from '@chakra-ui/react';

import { MonthCalendar } from './MonthCalendar';
import { WeekCalendar } from './WeekCalendar';
import { Event } from '../../types';

interface CalanderProps {
  view: 'week' | 'month';
  currentDate: Date;
  holidays: { [key: string]: string };
  navigate: (direction: 'prev' | 'next') => void;
  setView: (view: 'week' | 'month') => void;
  filteredEvents: Event[];
  notifiedEvents: string[];
}

export const Calander = ({
  filteredEvents,
  notifiedEvents,
  view,
  setView,
  currentDate,
  holidays,
  navigate,
}: CalanderProps) => {
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
        <WeekCalendar
          currentDate={currentDate}
          notifiedEvents={notifiedEvents}
          filteredEvents={filteredEvents}
        />
      )}
      {view === 'month' && (
        <MonthCalendar
          currentDate={currentDate}
          notifiedEvents={[]}
          filteredEvents={[]}
          holidays={holidays}
        />
      )}
    </VStack>
  );
};
