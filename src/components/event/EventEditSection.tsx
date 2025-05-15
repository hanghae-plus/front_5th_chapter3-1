import {
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Select,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
import React, { useState } from 'react';

import { useAddOrUpdateEvent } from '../../hooks/useAddOrUpdateEvent';
import { Event, EventForm, RepeatType } from '../../types';
import { getTimeErrorMessage } from '../../utils/timeValidation';
import { WarningAlert } from '../alert/WarningAlert';
const categories = ['업무', '개인', '가족', '기타'];
const notificationOptions = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
];

interface EventEditSectionProps {
  eventForm: EventForm;
  setEventForm: {
    setTitle: (title: string) => void;
    setDate: (date: string) => void;
    setDescription: (description: string) => void;
    setLocation: (location: string) => void;
    setCategory: (category: string) => void;
    setIsRepeating: (isRepeating: boolean) => void;
    setRepeatType: (repeatType: RepeatType) => void;
    setRepeatInterval: (repeatInterval: number) => void;
    setRepeatEndDate: (repeatEndDate: string) => void;
    setNotificationTime: (notificationTime: number) => void;
  };
  events: Event[];
  saveEvent: (event: Event) => Promise<void>;
  startTimeError: string | null;
  endTimeError: string | null;
  editingEvent: Event | null;
  isRepeating: boolean;
  handleStartTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleEndTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resetForm: () => void;
}

export function EventEditSection(props: EventEditSectionProps) {
  const {
    eventForm,
    setEventForm,
    events,
    saveEvent,
    startTimeError,
    endTimeError,
    editingEvent,
    isRepeating,
    handleStartTimeChange,
    handleEndTimeChange,
    resetForm,
  } = props;
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);

  const {
    setTitle,
    setDate,
    setDescription,
    setLocation,
    setCategory,
    setIsRepeating,
    setRepeatType,
    setRepeatInterval,
    setRepeatEndDate,
    setNotificationTime,
  } = setEventForm;

  const { addOrUpdateEvent } = useAddOrUpdateEvent({
    eventForm,
    events,
    setOverlappingEvents,
    setIsOverlapDialogOpen,
    saveEvent,
    startTimeError,
    endTimeError,
    editingEvent,
    isRepeating,
    resetForm,
  });

  return (
    <VStack w="400px" spacing={5} align="stretch">
      <Heading>{editingEvent ? '일정 수정' : '일정 추가'}</Heading>

      <FormControl>
        <FormLabel>제목</FormLabel>
        <Input value={eventForm.title} onChange={(e) => setTitle(e.target.value)} />
      </FormControl>

      <FormControl>
        <FormLabel>날짜</FormLabel>
        <Input type="date" value={eventForm.date} onChange={(e) => setDate(e.target.value)} />
      </FormControl>

      <HStack width="100%">
        <FormControl>
          <FormLabel>시작 시간</FormLabel>
          <Tooltip label={startTimeError} isOpen={!!startTimeError} placement="top">
            <Input
              type="time"
              value={eventForm.startTime}
              onChange={handleStartTimeChange}
              onBlur={() => getTimeErrorMessage(eventForm.startTime, eventForm.endTime)}
              isInvalid={!!startTimeError}
            />
          </Tooltip>
        </FormControl>
        <FormControl>
          <FormLabel>종료 시간</FormLabel>
          <Tooltip label={endTimeError} isOpen={!!endTimeError} placement="top">
            <Input
              type="time"
              value={eventForm.endTime}
              onChange={handleEndTimeChange}
              onBlur={() => getTimeErrorMessage(eventForm.startTime, eventForm.endTime)}
              isInvalid={!!endTimeError}
            />
          </Tooltip>
        </FormControl>
      </HStack>

      <FormControl>
        <FormLabel>설명</FormLabel>
        <Input value={eventForm.description} onChange={(e) => setDescription(e.target.value)} />
      </FormControl>

      <FormControl>
        <FormLabel>위치</FormLabel>
        <Input value={eventForm.location} onChange={(e) => setLocation(e.target.value)} />
      </FormControl>

      <FormControl>
        <FormLabel>카테고리</FormLabel>
        <Select value={eventForm.category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">카테고리 선택</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>반복 설정</FormLabel>
        <Checkbox isChecked={isRepeating} onChange={(e) => setIsRepeating(e.target.checked)}>
          반복 일정
        </Checkbox>
      </FormControl>

      <FormControl>
        <FormLabel>알림 설정</FormLabel>
        <Select
          value={eventForm.notificationTime}
          onChange={(e) => setNotificationTime(Number(e.target.value))}
        >
          {notificationOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FormControl>

      {isRepeating && (
        <VStack width="100%">
          <FormControl>
            <FormLabel>반복 유형</FormLabel>
            <Select
              value={eventForm.repeat.type}
              onChange={(e) => setRepeatType(e.target.value as RepeatType)}
            >
              <option value="daily">매일</option>
              <option value="weekly">매주</option>
              <option value="monthly">매월</option>
              <option value="yearly">매년</option>
            </Select>
          </FormControl>
          <HStack width="100%">
            <FormControl>
              <FormLabel>반복 간격</FormLabel>
              <Input
                type="number"
                value={eventForm.repeat.interval}
                onChange={(e) => setRepeatInterval(Number(e.target.value))}
                min={1}
              />
            </FormControl>
            <FormControl>
              <FormLabel>반복 종료일</FormLabel>
              <Input
                type="date"
                value={eventForm.repeat.endDate}
                onChange={(e) => setRepeatEndDate(e.target.value)}
              />
            </FormControl>
          </HStack>
        </VStack>
      )}

      <Button data-testid="event-submit-button" onClick={addOrUpdateEvent} colorScheme="blue">
        {editingEvent ? '일정 수정' : '일정 추가'}
      </Button>

      <WarningAlert
        eventForm={eventForm}
        isOverlapDialogOpen={isOverlapDialogOpen}
        setIsOverlapDialogOpen={setIsOverlapDialogOpen}
        overlappingEvents={overlappingEvents}
        saveEvent={saveEvent}
        editingEvent={editingEvent}
        isRepeating={isRepeating}
      />
    </VStack>
  );
}
