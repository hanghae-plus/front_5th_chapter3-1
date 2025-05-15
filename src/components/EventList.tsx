import { Text, VStack } from '@chakra-ui/react';
import { EventItemCard, EventSearchForm } from '.';
import { Event } from '@/types';

interface EventListProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredEvents: Event[];
  notifiedEvents: string[];
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
}

export const EventList = ({
  searchTerm,
  setSearchTerm,
  filteredEvents,
  notifiedEvents,
  onEdit,
  onDelete,
}: EventListProps) => {
  return (
    <VStack data-testid="event-list" w="500px" h="full" overflowY="auto">
      <EventSearchForm searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {filteredEvents.length === 0 ? (
        <Text>검색 결과가 없습니다.</Text>
      ) : (
        filteredEvents.map((event) => (
          <EventItemCard
            key={event.id}
            event={event}
            notifiedEvents={notifiedEvents}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
    </VStack>
  );
};
