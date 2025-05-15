import { useToast } from '@chakra-ui/react';

import { Event, EventForm } from '../types';
import { findOverlappingEvents } from '../utils/eventOverlap';

interface UseEventValidationProps {
  events: Event[];
  onSave: (event: Event | EventForm) => Promise<void>;
  onReset: () => void;
  openOverlapDialog: (events: Event[], eventToSave: Event | EventForm) => void;
}

export const useEventValidation = ({
  events,
  onSave,
  onReset,
  openOverlapDialog,
}: UseEventValidationProps) => {
  const toast = useToast();

  const validateAndSaveEvent = async (eventData: Event | EventForm) => {
    if (!eventData.title || !eventData.date || !eventData.startTime || !eventData.endTime) {
      toast({
        title: '필수 정보를 모두 입력해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const overlapping = findOverlappingEvents(eventData, events);
    if (overlapping.length > 0) {
      openOverlapDialog(overlapping, eventData);
    } else {
      await onSave(eventData);
      onReset();
    }
  };

  return { validateAndSaveEvent };
};
