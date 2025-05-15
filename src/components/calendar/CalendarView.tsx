/* eslint-disable no-unused-vars */
import { Heading, VStack } from '@chakra-ui/react';
import React from 'react';

import CalendarNavigation from './CalendarNavigation';
import { Event } from '../../types';
import MonthView from '../schedule/MonthView';
import WeekView from '../schedule/WeekView';

interface CalendarViewProps {
  view: 'week' | 'month';
  setView: (view: 'week' | 'month') => void;
  currentDate: Date;
  holidays: Record<string, string>;
  navigate: (direction: 'prev' | 'next') => void;
  filteredEvents: Event[];
  notifiedEvents: string[];
}

const CalendarView: React.FC<CalendarViewProps> = ({
  view,
  setView,
  currentDate,
  holidays,
  navigate,
  filteredEvents,
  notifiedEvents,
}) => {
  return (
    <VStack flex={1} spacing={5} align="stretch">
      <Heading>일정 보기</Heading>

      <CalendarNavigation view={view} setView={setView} navigate={navigate} />

      {view === 'week' && (
        <WeekView
          currentDate={currentDate}
          notifiedEvents={notifiedEvents}
          filteredEvents={filteredEvents}
        />
      )}
      {view === 'month' && (
        <MonthView
          currentDate={currentDate}
          holidays={holidays}
          notifiedEvents={notifiedEvents}
          filteredEvents={filteredEvents}
        />
      )}
    </VStack>
  );
};

export default CalendarView;
