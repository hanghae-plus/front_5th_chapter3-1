import { useToast } from '@chakra-ui/react';
import { useRef, useState } from 'react';

import { useEventForm } from '../hooks/useEventForm';
import { useEventOperations } from '../hooks/useEventOperations';
import { Event, EventForm as EventFormDataType } from '../types';
import { findOverlappingEvents } from '../utils/eventOverlap';

interface AppLogicProps {
  formState: ReturnType<typeof useEventForm>;
  events: Event[];
  saveEvent: ReturnType<typeof useEventOperations>['saveEvent'];
}

export function useAppLogic({ formState, events, saveEvent }: AppLogicProps) {
  const {
    title,
    date,
    startTime,
    endTime,
    description,
    location,
    category,
    isRepeating,
    repeatType,
    repeatInterval,
    repeatEndDate,
    notificationTime,
    editingEvent,
    resetForm,
    startTimeError,
    endTimeError,
  } = formState;

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();

  const addOrUpdateEvent = async () => {
    if (!title || !date || !startTime || !endTime) {
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

    const eventData: Event | EventFormDataType = {
      id: editingEvent ? editingEvent.id : undefined,
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat: {
        type: isRepeating ? repeatType : 'none',
        interval: repeatInterval,
        endDate: repeatEndDate || undefined,
      },
      notificationTime,
    };

    const overlapping = findOverlappingEvents(eventData, events);
    if (
      overlapping.length > 0 &&
      (!editingEvent || overlapping.some((opEvent) => opEvent.id !== editingEvent.id))
    ) {
      const distinctOverlappingEvents = editingEvent
        ? overlapping.filter((opEvent) => opEvent.id !== editingEvent.id)
        : overlapping;

      if (distinctOverlappingEvents.length > 0) {
        setOverlappingEvents(distinctOverlappingEvents);
        setIsOverlapDialogOpen(true);
      } else {
        await saveEvent(eventData);
        resetForm();
      }
    } else {
      await saveEvent(eventData);
      resetForm();
    }
  };

  const handleConfirmOverlap = async () => {
    setIsOverlapDialogOpen(false);
    const eventData: Event | EventFormDataType = {
      id: editingEvent ? editingEvent.id : undefined,
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat: {
        type: isRepeating ? repeatType : 'none',
        interval: repeatInterval,
        endDate: repeatEndDate || undefined,
      },
      notificationTime,
    };
    await saveEvent(eventData);
    resetForm();
  };

  return {
    isOverlapDialogOpen,
    setIsOverlapDialogOpen,
    overlappingEvents,
    cancelRef,
    addOrUpdateEvent,
    handleConfirmOverlap,
  };
}
