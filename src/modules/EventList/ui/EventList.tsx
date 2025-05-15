import { BellIcon } from '@chakra-ui/icons';
import { Box, HStack, Text, VStack } from '@chakra-ui/react';

import { notificationOptions } from '../../../based/constants/notificationOptions';
import { EventDeleteButton, EventEditButton } from '../../../features/event';
import { EventSearchInput } from '../../../features/event/ui/EventSearchInput';
import { Event } from '../../../types';

export const EventList = ({
  searchTerm,
  onSearch,
  filteredEvents,
  notifiedEvents,
  onEdit,
  onDelete,
}: {
  searchTerm: string;
  onSearch: (searchTerm: string) => void;
  filteredEvents: Event[];
  notifiedEvents: string[];
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
}) => {
  return (
    <VStack data-testid="event-list" w="500px" h="full" overflowY="auto">
      <EventSearchInput searchTerm={searchTerm} onSearch={onSearch} />

      {filteredEvents.length === 0 ? (
        <Text>검색 결과가 없습니다.</Text>
      ) : (
        filteredEvents.map((event) => (
          <Box
            key={event.id}
            borderWidth={1}
            borderRadius="lg"
            p={3}
            width="100%"
            data-testid="event-item"
          >
            <HStack justifyContent="space-between">
              <VStack align="start">
                <HStack>
                  {notifiedEvents.includes(event.id) && <BellIcon color="red.500" />}
                  <Text
                    fontWeight={notifiedEvents.includes(event.id) ? 'bold' : 'normal'}
                    color={notifiedEvents.includes(event.id) ? 'red.500' : 'inherit'}
                  >
                    {event.title}
                  </Text>
                </HStack>
                <Text>{event.date}</Text>
                <Text>
                  {event.startTime} - {event.endTime}
                </Text>
                <Text>{event.description}</Text>
                <Text>{event.location}</Text>
                <Text>카테고리: {event.category}</Text>
                {event.repeat.type !== 'none' && (
                  <Text>
                    반복: {event.repeat.interval}
                    {event.repeat.type === 'daily' && '일'}
                    {event.repeat.type === 'weekly' && '주'}
                    {event.repeat.type === 'monthly' && '월'}
                    {event.repeat.type === 'yearly' && '년'}
                    마다
                    {event.repeat.endDate && ` (종료: ${event.repeat.endDate})`}
                  </Text>
                )}
                <Text>
                  알림:{' '}
                  {
                    notificationOptions.find((option) => option.value === event.notificationTime)
                      ?.label
                  }
                </Text>
              </VStack>
              <HStack>
                <EventEditButton event={event} editEvent={onEdit} />
                <EventDeleteButton event={event} onDelete={onDelete} />
              </HStack>
            </HStack>
          </Box>
        ))
      )}
    </VStack>
  );
};
