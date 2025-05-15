/* eslint-disable no-unused-vars */
import { FormControl, FormLabel, Input, Text, VStack } from '@chakra-ui/react';

import { SearchItem } from './SearchItem';
import { Event } from '../../../types';

interface EventSearchProps {
  // 검색 관련
  searchTerm: string;
  setSearchTerm: (term: string) => void;

  // 이벤트 데이터
  filteredEvents: Event[];
  notifiedEvents: string[];

  // 이벤트 조작
  editEvent: (event: Event) => void;
  deleteEvent: (eventId: string) => void;
}

export const EventSearch = ({
  searchTerm,
  setSearchTerm,
  filteredEvents,
  notifiedEvents,
  editEvent,
  deleteEvent,
}: EventSearchProps) => {
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
        filteredEvents.map((event) => (
          <SearchItem
            key={event.id}
            event={event}
            notifiedEvents={notifiedEvents}
            editEvent={editEvent}
            deleteEvent={deleteEvent}
          />
        ))
      )}
    </VStack>
  );
};
