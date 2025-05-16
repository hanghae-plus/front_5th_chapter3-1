import { BellIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { Box, HStack, IconButton, Text, VStack } from '@chakra-ui/react';

import { notificationOptions } from '../../constants';
import { Event } from '../../types';

interface EventCardProps {
  event: Event;
  isNotified: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const EventCard = ({ event, isNotified, onEdit, onDelete }: EventCardProps) => {
  const getRepeatText = () => {
    if (event.repeat.type === 'none') {
      return null;
    }

    let typeText = '';
    switch (event.repeat.type) {
      case 'daily':
        typeText = '일';
        break;
      case 'weekly':
        typeText = '주';
        break;
      case 'monthly':
        typeText = '월';
        break;
      case 'yearly':
        typeText = '년';
        break;
      default:
        typeText = '';
    }

    return (
      <Text>
        반복: {event.repeat.interval}
        {typeText}마다
        {event.repeat.endDate && ` (종료: ${event.repeat.endDate})`}
      </Text>
    );
  };

  const getNotificationText = () => {
    const option = notificationOptions.find((option) => option.value === event.notificationTime);

    return option ? option.label : '';
  };

  return (
    <Box borderWidth={1} borderRadius="lg" p={3} width="100%">
      <HStack justifyContent="space-between">
        <VStack align="start">
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

          {getRepeatText()}

          <Text>알림: {getNotificationText()}</Text>
        </VStack>
        <HStack>
          <IconButton
            data-testid={`edit-event-button-${event.id}`}
            aria-label="Edit event"
            icon={<EditIcon />}
            onClick={onEdit}
          />
          <IconButton
            data-testid={`delete-event-button-${event.id}`}
            aria-label="Delete event"
            icon={<DeleteIcon />}
            onClick={onDelete}
          />
        </HStack>
      </HStack>
    </Box>
  );
};

export default EventCard;
