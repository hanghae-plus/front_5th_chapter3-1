/* eslint-disable no-unused-vars */
import { FormControl, FormLabel, Input, Text, VStack } from '@chakra-ui/react';

import { EventItem } from './event-item';
import { Event } from '../../types';

interface EventListProps {
  events: Event[];
  notifiedEvents: string[];
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (id: string) => void;
}

export const EventList = ({
  events,
  notifiedEvents,
  searchTerm,
  setSearchTerm,
  onEditEvent,
  onDeleteEvent,
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
          <EventItem
            key={event.id}
            event={event}
            isNotified={notifiedEvents.includes(event.id)}
            onEdit={() => onEditEvent(event)}
            onDelete={() => onDeleteEvent(event.id)}
          />
        ))
      )}
    </VStack>
  );
};
