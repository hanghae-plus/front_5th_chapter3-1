/* eslint-disable no-unused-vars */
import { useToast } from '@chakra-ui/react';

import { Event, EventForm } from '../types';
import { validateEventFields, validateEventTime } from '../utils/eventValidation';

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
    const fieldsValidation = validateEventFields(eventData);
    if (!fieldsValidation.isValid) {
      toast({
        title: fieldsValidation.errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const timeValidation = validateEventTime(eventData, events);
    if (!timeValidation.isValid) {
      if (timeValidation.overlappingEvents) {
        openOverlapDialog(timeValidation.overlappingEvents, eventData);
      } else {
        toast({
          title: timeValidation.errorMessage,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
      return;
    }

    await onSave(eventData);
    onReset();
  };

  return { validateAndSaveEvent };
};
