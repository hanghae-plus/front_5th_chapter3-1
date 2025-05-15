import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { Heading, HStack, IconButton, Select, VStack } from '@chakra-ui/react';

import { MonthCalendar } from './MonthCalendar';
import { WeekCalendar } from './WeekCalendar';
import { useCalendarContext } from '../../context/CalendarContext';
import { useNotificationContext } from '../../context/NotificationContext';
import { useSearchContext } from '../../context/SearchContext';

export const Calander = () => {
  const { view, setView, currentDate, holidays, navigate } = useCalendarContext();
  const { notifiedEvents } = useNotificationContext();
  const { filteredEvents } = useSearchContext();
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
