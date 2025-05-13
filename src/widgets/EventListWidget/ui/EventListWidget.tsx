import { VStack, Text } from '@chakra-ui/react';

import { Event } from '../../../entities/event/model/types';
import { EventCard } from '../../../features/event-card/ui/EventCard';
import { SearchBar } from '../../../features/search/ui/SearchBar';

interface EventListWidgetProps {
  searchTerm: string;
  filteredEvents: Event[];
  notifiedEvents: string[];
  notificationOptions: Array<{ value: number; label: string }>;
  setSearchTerm: (term: string) => void;
  editEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;
}

export const EventListWidget = ({
  searchTerm,
  filteredEvents,
  notifiedEvents,
  notificationOptions,
  setSearchTerm,
  editEvent,
  deleteEvent,
}: EventListWidgetProps) => {
  return (
    <VStack data-testid="event-list" w="500px" h="full" overflowY="auto">
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {filteredEvents.length === 0 ? (
        <Text>검색 결과가 없습니다.</Text>
      ) : (
        filteredEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            notifiedEvents={notifiedEvents}
            notificationOptions={notificationOptions}
            onEdit={editEvent}
            onDelete={deleteEvent}
          />
        ))
      )}
    </VStack>
  );
};
