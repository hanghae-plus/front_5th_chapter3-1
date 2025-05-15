import { BellIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { HStack, VStack, Text, IconButton } from '@chakra-ui/react';

import { notificationOptions } from '../constant';
import { Event } from '../types';

interface EventItemProps {
  event: Event;
  notifiedEvents: string[];
  deleteEvent: (id: string) => void;
  editEvent: (event: Event) => void;
}

export const EventItem = ({ event, notifiedEvents, deleteEvent, editEvent }: EventItemProps) => (
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
        알림: {notificationOptions.find((option) => option.value === event.notificationTime)?.label}
      </Text>
    </VStack>
    <HStack>
      <IconButton aria-label="Edit event" icon={<EditIcon />} onClick={() => editEvent(event)} />
      <IconButton
        aria-label="Delete event"
        icon={<DeleteIcon />}
        onClick={() => deleteEvent(event.id)}
      />
    </HStack>
  </HStack>
);
