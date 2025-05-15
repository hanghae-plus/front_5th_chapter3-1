import { ChevronRightIcon, ChevronLeftIcon } from '@chakra-ui/icons';
import { HStack, IconButton, Select } from '@chakra-ui/react';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { useCalendarView } from '@/hooks';
import type { CalendarView } from '@/types';

export function Calendar() {
  const { view, setView, navigate } = useCalendarView();
  return (
    <>
      <HStack mx="auto" justifyContent="space-between">
        <IconButton
          aria-label="Previous"
          icon={<ChevronLeftIcon />}
          onClick={() => navigate('prev')}
        />
        <Select
          aria-label="view"
          value={view}
          onChange={(e) => setView(e.target.value as CalendarView)}
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

      {view === 'week' && <WeekView />}
      {view === 'month' && <MonthView />}
    </>
  );
}
