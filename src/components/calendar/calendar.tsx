/* eslint-disable no-unused-vars */
import { Heading, VStack } from '@chakra-ui/react';

import { Event } from '../../types';

import { WeekView, MonthView, CalendarHeader } from './';

interface CalendarProps {
  view: 'week' | 'month';
  setView: (view: 'week' | 'month') => void;
  navigate: (direction: 'prev' | 'next') => void;
  currentDate: Date;
  events: Event[];
  notifiedEvents: string[];
  holidays: Record<string, string>;
}

export function Calendar({
  view,
  setView,
  navigate,
  currentDate,
  events,
  notifiedEvents,
  holidays,
}: CalendarProps) {
  return (
    <VStack flex={1} spacing={5} align="stretch">
      <Heading>일정 보기</Heading>
      <CalendarHeader view={view} setView={setView} navigate={navigate} />

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
}
