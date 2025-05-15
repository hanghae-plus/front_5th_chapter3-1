import { useToast } from '@chakra-ui/react';
import { useState, useRef } from 'react';

import { Event, EventForm as EventFormType, RepeatType } from '../types';
import { findOverlappingEvents } from '../utils/eventOverlap';

interface EventManagementProps {
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
  events: Event[];

  onResetForm: () => void;
  onSave: (eventData: Event | EventFormType) => Promise<void>;
}

export const useEventManagement = ({
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
  events,
  onResetForm,
  onSave,
}: EventManagementProps) => {
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();

  const validateEventData = () => {
    if (!title || !date || !startTime || !endTime) {
      toast({
        title: '필수 정보를 모두 입력해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (startTimeError || endTimeError) {
      toast({
        title: '시간 설정을 확인해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
    return true;
  };

  const createEventDataObject = (): Event | EventFormType => ({
    id: editingEvent?.id,
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

  const handleSubmitEvent = async () => {
    if (!validateEventData()) return;

    const eventData = createEventDataObject();
    const overlapping = findOverlappingEvents(eventData, events);
    if (overlapping.length > 0) {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
    } else {
      await onSave(eventData);
      onResetForm();
    }
  };

  const handleContinueSaveAfterOverlap = async () => {
    setIsOverlapDialogOpen(false);
    const eventData = createEventDataObject();
    await onSave(eventData);
    onResetForm();
  };

  return {
    handleSubmitEvent,
    handleContinueSaveAfterOverlap,
    isOverlapDialogOpen,
    setIsOverlapDialogOpen,
    overlappingEvents,
    cancelRef,
  };
};
