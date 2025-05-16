import { Text, VStack } from '@chakra-ui/react';
import { Dispatch, SetStateAction } from 'react';

import EventCard from './EventCard';
import SearchBar from './SearchBar';
import { Event } from '../../types';

interface EventListProps {
  events: Event[];
  notifiedEvents: string[];
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  // eslint-disable-next-line no-unused-vars
  onEdit: (event: Event) => void;
  // eslint-disable-next-line no-unused-vars
  onDelete: (id: string) => void;
}

const EventList = ({
  events,
  notifiedEvents,
  searchTerm,
  setSearchTerm,
  onEdit,
  onDelete,
}: EventListProps) => {
  // context로 바꿀 수 있을 듯
  const filteredEvents = events.filter((event) => event.title.includes(searchTerm));

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
            isNotified={notifiedEvents.includes(event.id)}
            onEdit={() => onEdit(event)}
            onDelete={() => onDelete(event.id)}
          />
        ))
      )}
    </VStack>
  );
};

export default EventList;
