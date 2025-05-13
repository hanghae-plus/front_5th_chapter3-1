import { VStack, Heading, Button } from '@chakra-ui/react';
import { ChangeEvent } from 'react';

import { Event, RepeatType } from '../../../entities/event/model/types';
import { EventInfo } from '../../../features/event-info/ui/EventInfo';
import { EventOptions } from '../../../features/event-options/ui/EventOptions';
import { RepeatSettings } from '../../../features/event-repeat/ui/RepeatSettings';

interface EventFormWidgetProps {
  // 기본 정보
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;

  // 시간 에러
  startTimeError: string | null;
  endTimeError: string | null;

  // 반복 설정
  isRepeating: boolean;
  repeatType: RepeatType;
  repeatInterval: number;
  repeatEndDate: string;

  // 알림 설정
  notificationTime: number;
  notificationOptions: Array<{ value: number; label: string }>;

  // 이벤트 상태
  editingEvent: Event | null;

  // 이벤트 핸들러
  setTitle: (title: string) => void;
  setDate: (date: string) => void;
  handleStartTimeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleEndTimeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  setDescription: (description: string) => void;
  setLocation: (location: string) => void;
  setCategory: (category: string) => void;
  setIsRepeating: (isRepeating: boolean) => void;
  setRepeatType: (repeatType: RepeatType) => void;
  setRepeatInterval: (interval: number) => void;
  setRepeatEndDate: (date: string) => void;
  setNotificationTime: (time: number) => void;
  onSubmit: () => void;
  addOrUpdateEvent: () => void;
}

export const EventFormWidget = ({
  // 기본 정보
  title,
  date,
  startTime,
  endTime,
  description,
  location,
  category,

  // 시간 에러
  startTimeError,
  endTimeError,

  // 반복 설정
  isRepeating,
  repeatType,
  repeatInterval,
  repeatEndDate,

  // 알림 설정
  notificationTime,
  notificationOptions,

  // 이벤트 상태
  editingEvent,

  // 이벤트 핸들러
  setTitle,
  setDate,
  handleStartTimeChange,
  handleEndTimeChange,
  setDescription,
  setLocation,
  setCategory,
  setIsRepeating,
  setRepeatType,
  setRepeatInterval,
  setRepeatEndDate,
  setNotificationTime,
  addOrUpdateEvent,
}: EventFormWidgetProps) => {
  return (
    <VStack w="400px" spacing={5} align="stretch">
      <Heading>{editingEvent ? '일정 수정' : '일정 추가'}</Heading>

      <EventInfo
        title={title}
        setTitle={setTitle}
        date={date}
        setDate={setDate}
        startTime={startTime}
        endTime={endTime}
        startTimeError={startTimeError}
        endTimeError={endTimeError}
        handleStartTimeChange={handleStartTimeChange}
        handleEndTimeChange={handleEndTimeChange}
        description={description}
        setDescription={setDescription}
        location={location}
        setLocation={setLocation}
      />

      <EventOptions
        category={category}
        setCategory={setCategory}
        isRepeating={isRepeating}
        setIsRepeating={setIsRepeating}
        notificationTime={notificationTime}
        setNotificationTime={setNotificationTime}
        notificationOptions={notificationOptions}
      />

      {isRepeating && (
        <RepeatSettings
          repeatType={repeatType}
          repeatInterval={repeatInterval}
          repeatEndDate={repeatEndDate}
          setRepeatType={setRepeatType}
          setRepeatInterval={setRepeatInterval}
          setRepeatEndDate={setRepeatEndDate}
        />
      )}

      <Button data-testid="event-submit-button" onClick={addOrUpdateEvent} colorScheme="blue">
        {editingEvent ? '일정 수정' : '일정 추가'}
      </Button>
    </VStack>
  );
};
