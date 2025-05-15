/* eslint-disable no-unused-vars */
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { Heading, HStack, IconButton, Select, VStack } from '@chakra-ui/react';

import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { Event } from '../../../types';

interface EventViewProps {
  // 캘린더 뷰 관련
  view: 'week' | 'month';
  setView: (view: 'week' | 'month') => void;
  currentDate: Date;

  // 이벤트 데이터
  filteredEvents: Event[];
  notifiedEvents: string[];

  // 휴일 데이터
  holidays: Record<string, string>;

  // 네비게이션
  navigate: (direction: 'prev' | 'next') => void;
}

export const EventView = ({
  view,
  setView,
  currentDate,
  filteredEvents,
  notifiedEvents,
  holidays,
  navigate,
}: EventViewProps) => {
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
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          holidays={holidays}
        />
      )}
    </VStack>
  );
};
