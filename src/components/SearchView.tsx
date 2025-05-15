import { FormControl, FormLabel, Input, Text, VStack } from '@chakra-ui/react';

import { useSearch } from '../hooks/useSearch';
import { Event } from '../types';
import { EventList } from './EventList';

interface Props {
  events: Event[];
  currentDate: Date;
  view: 'month' | 'week';
  editEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;
  notifiedEvents: string[];
}

export const SearchView = ({
  events,
  currentDate,
  view,
  editEvent,
  deleteEvent,
  notifiedEvents,
}: Props) => {
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);
  return (
    <VStack data-testid="event-list" w="500px" h="full" overflowY="auto">
      <FormControl>
        <FormLabel>일정 검색</FormLabel>
        <Input
          placeholder="검색어를 입력하세요"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </FormControl>

      {filteredEvents.length === 0 ? (
        <Text>검색 결과가 없습니다.</Text>
      ) : (
        <EventList
          events={filteredEvents}
          editEvent={editEvent}
          deleteEvent={deleteEvent}
          notifiedEvents={notifiedEvents}
        />
      )}
    </VStack>
  );
};
