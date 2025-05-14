import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { Heading, HStack, IconButton, Select, VStack } from '@chakra-ui/react';
import { useAtom } from 'jotai';

import { MonthCalendar } from './MonthCalendar';
import { WeekCalendar } from './WeekCalendar';
import { useCalendarView } from '../../hooks/useCalendarView';
import { calanderViewAtom } from '../../state/calancerViewAtom';
import { Event } from '../../types';

interface CalanderProps {
  filteredEvents: Event[];
  notifiedEvents: string[];
}

export const Calander = ({ filteredEvents, notifiedEvents }: CalanderProps) => {
  const { currentDate, holidays, navigate } = useCalendarView();

  const [calanderView, setCalanderView] = useAtom(calanderViewAtom);

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
          value={calanderView}
          onChange={(e) => setCalanderView(e.target.value as 'week' | 'month')}
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

      {calanderView === 'week' && (
        <WeekCalendar
          currentDate={currentDate}
          notifiedEvents={notifiedEvents}
          filteredEvents={filteredEvents}
        />
      )}
      {calanderView === 'month' && (
        <MonthCalendar
          currentDate={currentDate}
          notifiedEvents={notifiedEvents}
          filteredEvents={filteredEvents}
          holidays={holidays}
        />
      )}
    </VStack>
  );
};
