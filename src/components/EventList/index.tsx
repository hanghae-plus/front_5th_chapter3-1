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

import { Event } from '../../types';

interface EventListProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  events: Event[];
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
  notifiedEventIds: string[];
}

const notificationLabels: Record<number, string> = {
  1: '1분 전',
  10: '10분 전',
  60: '1시간 전',
  120: '2시간 전',
  1440: '1일 전',
};

export const EventList = ({
  searchTerm,
  onSearchChange,
  events,
  onEdit,
  onDelete,
  notifiedEventIds,
}: EventListProps) => {
  return (
    <VStack
      data-testid="event-list"
      w="500px"
      h="full"
      overflowY="auto"
      spacing={4}
      align="stretch"
    >
      <FormControl>
        <FormLabel>일정 검색</FormLabel>
        <Input
          placeholder="검색어를 입력하세요"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </FormControl>

      {events.length === 0 ? (
        <Text>검색 결과가 없습니다.</Text>
      ) : (
        events.map((event) => {
          const isNotified = notifiedEventIds.includes(event.id);
          return (
            <Box key={event.id} borderWidth={1} borderRadius="lg" p={3} width="100%">
              <HStack justifyContent="space-between" align="start">
                <VStack align="start" spacing={1}>
                  <HStack>
                    {isNotified && <BellIcon color="red.500" />}
                    <Text
                      fontWeight={isNotified ? 'bold' : 'normal'}
                      color={isNotified ? 'red.500' : 'inherit'}
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
                      {event.repeat.type === 'yearly' && '년'}마다
                      {event.repeat.endDate && ` (종료: ${event.repeat.endDate})`}
                    </Text>
                  )}
                  <Text>알림: {notificationLabels[event.notificationTime] ?? '없음'}</Text>
                </VStack>

                <VStack>
                  <IconButton
                    aria-label="Edit event"
                    icon={<EditIcon />}
                    onClick={() => onEdit(event)}
                    size="sm"
                  />
                  <IconButton
                    aria-label="Delete event"
                    icon={<DeleteIcon />}
                    onClick={() => onDelete(event.id)}
                    size="sm"
                  />
                </VStack>
              </HStack>
            </Box>
          );
        })
      )}
    </VStack>
  );
};
