/* eslint-disable no-unused-vars */
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
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { categories, notificationOptions } from '../config/const.ts';
import { useEventForm } from '../hooks/useEventForm.ts';
import { Event, EventForm } from '../types';
import { findOverlappingEvents } from '../utils/eventOverlap.ts';
import { EventConflictAlertDialog } from './dialog/ConflictWarn.tsx';

interface EventFormComponentProps {
  editingEvent: Event | null;
  events: Event[];
  saveEvent: (eventData: Event | EventForm) => Promise<void>;
}

export const EventFormComponent = ({
  saveEvent,
  events,
  editingEvent,
}: EventFormComponentProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    errors,
    startTimeError,
    endTimeError,
    resetForm,
  } = useEventForm(editingEvent);

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);

  const toast = useToast();

  const onSubmit = handleSubmit(async (data) => {
    if (!data.title || !data.date || !data.startTime || !data.endTime) {
      toast({
        title: '필수 정보를 모두 입력해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (startTimeError || endTimeError) {
      toast({
        title: '시간 설정을 확인해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const eventData: Event | EventForm = {
      id: editingEvent ? editingEvent.id : undefined,
      title: data.title,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      description: data.description,
      location: data.location,
      category: data.category,
      repeat: {
        type: data.isRepeating ? data.repeatType : 'none',
        interval: data.repeatInterval,
        endDate: data.repeatEndDate || undefined,
      },
      notificationTime: data.notificationTime,
    };

    const overlapping = findOverlappingEvents(eventData, events);
    if (overlapping.length > 0) {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
    } else {
      await saveEvent(eventData);
      resetForm();
    }
  });

  const onAlertClick = () => {
    setIsOverlapDialogOpen(false);
    const data = watch();
    saveEvent({
      id: editingEvent ? editingEvent.id : undefined,
      title: data.title,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      description: data.description,
      location: data.location,
      category: data.category,
      repeat: {
        type: data.isRepeating ? data.repeatType : 'none',
        interval: data.repeatInterval,
        endDate: data.repeatEndDate || undefined,
      },
      notificationTime: data.notificationTime,
    });
  };

  useEffect(() => {
    const event = editingEvent;
    if (!event) return;
    setValue('title', event.title);
    setValue('date', event.date);
    setValue('startTime', event.startTime);
    setValue('endTime', event.endTime);
    setValue('description', event.description);
    setValue('location', event.location);
    setValue('category', event.category);
    setValue('isRepeating', event.repeat.type !== 'none');
    setValue('repeatType', event.repeat.type);
    setValue('repeatInterval', event.repeat.interval);
    setValue('repeatEndDate', event.repeat.endDate || '');
    setValue('notificationTime', event.notificationTime);
  }, [editingEvent, setValue]);

  const isRepeating = watch('isRepeating');

  return (
    <>
      <VStack w="400px" spacing={5} align="stretch" as="form" onSubmit={onSubmit}>
        <Heading>{editingEvent ? '일정 수정' : '일정 추가'}</Heading>

        <FormControl isInvalid={!!errors.title}>
          <FormLabel>제목</FormLabel>
          <Input {...register('title', { required: true })} />
        </FormControl>

        <FormControl isInvalid={!!errors.date}>
          <FormLabel>날짜</FormLabel>
          <Input type="date" {...register('date', { required: true })} />
        </FormControl>

        <HStack width="100%">
          <FormControl isInvalid={!!errors.startTime || !!startTimeError}>
            <FormLabel>시작 시간</FormLabel>
            <Tooltip label={startTimeError} isOpen={!!startTimeError} placement="top">
              <Input
                type="time"
                {...register('startTime', { required: true })}
                isInvalid={!!startTimeError}
              />
            </Tooltip>
          </FormControl>
          <FormControl isInvalid={!!errors.endTime || !!endTimeError}>
            <FormLabel>종료 시간</FormLabel>
            <Tooltip label={endTimeError} isOpen={!!endTimeError} placement="top">
              <Input
                type="time"
                {...register('endTime', { required: true })}
                isInvalid={!!endTimeError}
              />
            </Tooltip>
          </FormControl>
        </HStack>

        <FormControl>
          <FormLabel>설명</FormLabel>
          <Input {...register('description')} />
        </FormControl>

        <FormControl>
          <FormLabel>위치</FormLabel>
          <Input {...register('location')} />
        </FormControl>

        <FormControl>
          <FormLabel>카테고리</FormLabel>
          <Select {...register('category')}>
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
          <Checkbox {...register('isRepeating')}>반복 일정</Checkbox>
        </FormControl>

        <FormControl>
          <FormLabel>알림 설정</FormLabel>
          <Select {...register('notificationTime', { valueAsNumber: true })}>
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
              <Select {...register('repeatType')}>
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
                  {...register('repeatInterval', { valueAsNumber: true, min: 1 })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>반복 종료일</FormLabel>
                <Input type="date" {...register('repeatEndDate')} />
              </FormControl>
            </HStack>
          </VStack>
        )}

        <Button type="submit" data-testid="event-submit-button" colorScheme="blue">
          {editingEvent ? '일정 수정' : '일정 추가'}
        </Button>
      </VStack>
      <EventConflictAlertDialog
        isOverlapDialogOpen={isOverlapDialogOpen}
        setIsOverlapDialogOpen={setIsOverlapDialogOpen}
        overlappingEvents={overlappingEvents}
        onAlertClick={onAlertClick}
      />
    </>
  );
};
