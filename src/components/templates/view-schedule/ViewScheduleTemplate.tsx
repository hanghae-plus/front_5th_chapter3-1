import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { Heading, HStack, IconButton, Select, VStack } from '@chakra-ui/react';
import { Fragment } from 'react';

import { LabelInput } from '@/components/atoms/common/label-input';
import { MonthlyCalendar, WeeklyCalendar } from '@/components/organisms/schedule/calender';
import { ScheduleCardList } from '@/components/organisms/schedule/card-list';
import { useCalendarView } from '@/hooks/useCalendarView';
import { useSearch } from '@/hooks/useSearch';
import { Event } from '@/types';

interface ViewScheduleTemplateProps {
  events: Event[];
  notifiedEvents: string[];
  editEvent: (event: Event) => void;
  deleteEvent: (eventId: string) => void;
}

export const ViewScheduleTemplate = ({
  events,
  notifiedEvents,
  editEvent,
  deleteEvent,
}: ViewScheduleTemplateProps) => {
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  return (
    <Fragment>
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
          <WeeklyCalendar
            currentDate={currentDate}
            filteredEvents={filteredEvents}
            notifiedEvents={notifiedEvents}
          />
        )}
        {view === 'month' && (
          <MonthlyCalendar
            currentDate={currentDate}
            holidays={holidays}
            filteredEvents={filteredEvents}
            notifiedEvents={notifiedEvents}
          />
        )}
      </VStack>

      <VStack data-testid="event-list" w="500px" h="full" overflowY="auto">
        <LabelInput
          title="일정 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <ScheduleCardList
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          editEvent={editEvent}
          deleteEvent={deleteEvent}
        />
      </VStack>
    </Fragment>
  );
};
