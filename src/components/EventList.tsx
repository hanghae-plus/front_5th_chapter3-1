import { FormControl, FormLabel, Input, Text, VStack } from '@chakra-ui/react';

import { Event } from '../types';
import { EventListItem } from './EventListItem';

interface EventListProps {
  events: Event[];
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
  notifiedEvents: string[];
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
}

export const EventList = ({
  events,
  searchTerm,
  setSearchTerm,
  notifiedEvents,
  onEdit,
  onDelete,
}: EventListProps) => {
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

      {events.length === 0 ? (
        <Text>검색 결과가 없습니다.</Text>
      ) : (
        events.map((event) => (
          <EventListItem
            key={event.id}
            event={event}
            isNotified={notifiedEvents.includes(event.id)}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
    </VStack>
  );
};
