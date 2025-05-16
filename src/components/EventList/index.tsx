import { BellIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import {
  Box,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Text,
  VStack,
} from '@chakra-ui/react';

import { notificationOptions } from './data';
import { Event } from '../../types';

interface EventListProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredEvents: Event[];
  notifiedEvents: string[];
  editEvent: (event: Event) => void;
  deleteEvent: (eventId: string) => void;
}

export function EventList({
  searchTerm,
  setSearchTerm,
  filteredEvents,
  notifiedEvents,
  editEvent,
  deleteEvent,
}: EventListProps) {
  return (
    <VStack
      data-testid="event-list"
      w="500px"
      h="full"
      overflowY="auto"
      spacing={3}
      align="stretch"
    >
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
          <Box
            key={event.id}
            data-testid={`event-${event.id}`}
            borderWidth={1}
            borderRadius="lg"
            p={3}
            width="100%"
          >
            <HStack justifyContent="space-between">
              <VStack align="start" spacing={0.5}>
                <HStack>
                  {notifiedEvents.includes(event.id) && <BellIcon color="red.500" />}
                  <Text
                    fontWeight={notifiedEvents.includes(event.id) ? 'bold' : 'normal'}
                    color={notifiedEvents.includes(event.id) ? 'red.500' : 'inherit'}
                  >
                    {event.title}
                  </Text>
                </HStack>
                <Text fontSize="sm">{event.date}</Text>
                <Text fontSize="sm">
                  {event.startTime} - {event.endTime}
                </Text>
                {event.description && <Text fontSize="sm">{event.description}</Text>}
                {event.location && <Text fontSize="sm">{event.location}</Text>}
                {event.category && <Text fontSize="sm">카테고리: {event.category}</Text>}
                {event.repeat.type !== 'none' && (
                  <Text fontSize="sm">
                    반복: {event.repeat.interval}
                    {event.repeat.type === 'daily' && '일'}
                    {event.repeat.type === 'weekly' && '주'}
                    {event.repeat.type === 'monthly' && '월'}
                    {event.repeat.type === 'yearly' && '년'}
                    마다
                    {event.repeat.endDate && ` (종료: ${event.repeat.endDate})`}
                  </Text>
                )}
                <Text fontSize="sm">
                  알림:{' '}
                  {
                    notificationOptions.find((option) => option.value === event.notificationTime)
                      ?.label
                  }
                </Text>
              </VStack>
              <HStack>
                <IconButton
                  aria-label="Edit event"
                  icon={<EditIcon />}
                  data-testid={`edit-event-${event.id}`}
                  size="sm"
                  onClick={() => editEvent(event)}
                />
                <IconButton
                  aria-label="Delete event"
                  icon={<DeleteIcon />}
                  data-testid={`delete-event-${event.id}`}
                  size="sm"
                  onClick={() => deleteEvent(event.id)}
                />
              </HStack>
            </HStack>
          </Box>
        ))
      )}
    </VStack>
  );
}
