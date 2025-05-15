import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { Heading, Select, IconButton, HStack, VStack } from '@chakra-ui/react';

import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import {
  CalendarViewActions,
  CalendarViewState,
} from '../../../features/event/model/useCalendarViewStateAndActions';

export const EventCalendar = ({
  viewState,
  viewActions,
  notifiedEvents,
}: {
  viewState: CalendarViewState;
  viewActions: CalendarViewActions;
  notifiedEvents: string[];
}) => {
  const { view, currentDate, filteredEvents, holidays } = viewState;
  const { setView, navigate } = viewActions;

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
        <WeekView
          currentDate={currentDate}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
        />
      )}
      {view === 'month' && (
        <MonthView
          currentDate={currentDate}
          holidays={holidays}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
        />
      )}
    </VStack>
  );
};
