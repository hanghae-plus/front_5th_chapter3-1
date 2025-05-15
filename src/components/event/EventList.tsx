/* eslint-disable no-unused-vars */
import { Text, VStack } from '@chakra-ui/react';
import React from 'react';

import EventCard from './EventCard';
import EventSearch from './EventSearch';
import { Event } from '../../types';

interface EventListProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredEvents: Event[];
  notifiedEvents: string[];
  notificationOptions: { value: number; label: string }[];
  editEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;
}

const EventList: React.FC<EventListProps> = ({
  searchTerm,
  setSearchTerm,
  filteredEvents,
  notifiedEvents,
  notificationOptions,
  editEvent,
  deleteEvent,
}) => {
  return (
    <VStack data-testid="event-list" w="500px" h="full" overflowY="auto">
      <EventSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {filteredEvents.length === 0 ? (
        <Text>검색 결과가 없습니다.</Text>
      ) : (
        filteredEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            isNotified={notifiedEvents.includes(event.id)}
            notificationOptions={notificationOptions}
            onEdit={editEvent}
            onDelete={deleteEvent}
          />
        ))
      )}
    </VStack>
  );
};

export default EventList;
