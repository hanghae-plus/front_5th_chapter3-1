import { useToast } from '@chakra-ui/react';

import { Event, EventForm, RepeatType } from '../types';
import { findOverlappingEvents } from '../utils/eventOverlap';

interface UseEventSubmissionProps {
  events: Event[];
  saveEvent: (eventData: Event | EventForm) => Promise<void>;
  resetForm: () => void;
  setIsOverlapDialogOpen: (isOpen: boolean) => void;
  setOverlappingEvents: (events: Event[]) => void;
}

interface EventSubmissionData {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  isRepeating: boolean;
  repeatType: RepeatType;
  repeatInterval: number;
  repeatEndDate: string;
  notificationTime: number;
  startTimeError: string | null;
  endTimeError: string | null;
  editingEvent: Event | null;
}

export function useEventSubmission({
  events,
  saveEvent,
  resetForm,
  setIsOverlapDialogOpen,
  setOverlappingEvents,
}: UseEventSubmissionProps) {
  const toast = useToast();

  const addOrUpdateEvent = async (data: EventSubmissionData) => {
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
      startTimeError,
      endTimeError,
      editingEvent,
    } = data;

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

    const eventData: Event | EventForm = {
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
    if (overlapping.length > 0) {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
    } else {
      await saveEvent(eventData);
      resetForm();
    }
  };

  const handleOverlapConfirm = (data: EventSubmissionData) => {
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
    } = data;

    setIsOverlapDialogOpen(false);
    saveEvent({
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
    });
  };

  return {
    addOrUpdateEvent,
    handleOverlapConfirm,
  };
}
