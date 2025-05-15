import { BellIcon } from '@chakra-ui/icons';
import { HStack, Text, VStack } from '@chakra-ui/react';
import { FC } from 'react';

import { Event } from '../types';

const notificationOptions = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
];

type EventDetailsProps = {
  event: Event;
  isNotified: boolean;
};

const EventDetails: FC<EventDetailsProps> = ({ event, isNotified }) => {
  const getRepeatText = () => {
    if (event.repeat.type === 'none') return null;

    let text = `반복: ${event.repeat.interval}`;
    switch (event.repeat.type) {
      case 'daily':
        text += '일';
        break;
      case 'weekly':
        text += '주';
        break;
      case 'monthly':
        text += '월';
        break;
      case 'yearly':
        text += '년';
        break;
    }
    text += '마다';
    if (event.repeat.endDate) {
      text += ` (종료: ${event.repeat.endDate})`;
    }
    return text;
  };

  const notificationLabel =
    notificationOptions.find((option) => option.value === event.notificationTime)?.label || '';

  return (
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
      {event.repeat.type !== 'none' && <Text>{getRepeatText()}</Text>}
      <Text>알림: {notificationLabel}</Text>
    </VStack>
  );
};

export default EventDetails;
