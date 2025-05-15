import { useToast } from '@chakra-ui/react';

import { Event, EventForm } from '../types';
import { findOverlappingEvents } from '../utils/eventOverlap';

interface UseAddOrUpdateEventProps {
  eventForm: EventForm;
  events: Event[];
  setOverlappingEvents: (events: Event[]) => void;
  setIsOverlapDialogOpen: (isOpen: boolean) => void;
  saveEvent: (event: Event) => Promise<void>;
  startTimeError: string | null;
  endTimeError: string | null;
  editingEvent: Event | null;
  isRepeating: boolean;
  resetForm: () => void;
}

export function useAddOrUpdateEvent({
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
}: UseAddOrUpdateEventProps) {
  const toast = useToast();

  const addOrUpdateEvent = async () => {
    if (!eventForm.title || !eventForm.date || !eventForm.startTime || !eventForm.endTime) {
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
      title: eventForm.title,
      date: eventForm.date,
      startTime: eventForm.startTime,
      endTime: eventForm.endTime,
      description: eventForm.description,
      location: eventForm.location,
      category: eventForm.category,
      repeat: {
        type: isRepeating ? eventForm.repeat.type : 'none',
        interval: eventForm.repeat.interval,
        endDate: eventForm.repeat.endDate || undefined,
      },
      notificationTime: eventForm.notificationTime,
    };

    const overlapping = findOverlappingEvents(eventData, events);
    if (overlapping.length > 0) {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
    } else {
      await saveEvent(eventData as Event);
      resetForm();
    }
  };

  return { addOrUpdateEvent };
}
