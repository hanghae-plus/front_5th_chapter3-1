import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { VStack, Heading, HStack, IconButton, Select } from '@chakra-ui/react';
import React from 'react';

import { Event } from '../../types';
import MonthView from '../calendar/MonthView.tsx';
import WeekView from '../calendar/WeekView.tsx';

interface CalendarViewContainerProps {
  view: 'week' | 'month';
  setView: (view: 'week' | 'month') => void;
  currentDate: Date;
  navigate: (direction: 'prev' | 'next') => void;
  filteredEvents: Event[];
  notifiedEvents: string[];
  weekDays: string[];
  holidays: { [key: string]: string };
}

const CalendarViewContainer: React.FC<CalendarViewContainerProps> = ({
  view,
  setView,
  currentDate,
  navigate,
  filteredEvents,
  notifiedEvents,
  weekDays,
  holidays,
}) => {
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
      {view === 'week' ? (
        <WeekView
          currentDate={currentDate}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          weekDays={weekDays}
        />
      ) : (
        <MonthView
          currentDate={currentDate}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          weekDays={weekDays}
          holidays={holidays}
        />
      )}
    </VStack>
  );
};

export default CalendarViewContainer;
