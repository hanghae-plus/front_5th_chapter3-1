import { useToast } from '@chakra-ui/react';

import { useEventFormStateAndActions } from './useEventFormStateAndActions';
import { useEventOperationsStateAndActions } from './useEventOperationsStateAndActions';
import { useOverlapStateAndActions } from './useOverlapStateAndActions';
import { findOverlappingEvents } from '../../../based/utils/eventOverlap';
import { Event, EventForm } from '../../../types';

export const useEventSubmission = (
  formState: ReturnType<typeof useEventFormStateAndActions>['formState'],
  formActions: ReturnType<typeof useEventFormStateAndActions>['formActions'],
  operationsState: ReturnType<typeof useEventOperationsStateAndActions>['operationsState'],
  operationsActions: ReturnType<typeof useEventOperationsStateAndActions>['operationsActions'],
  overlapActions: ReturnType<typeof useOverlapStateAndActions>['overlapActions']
) => {
  const toast = useToast();

  const addOrUpdateEvent = async () => {
    const {
      title,
      date,
      startTime,
      endTime,
      startTimeError,
      endTimeError,
      editingEvent,
      description,
      location,
      category,
      isRepeating,
      repeatType,
      repeatInterval,
      repeatEndDate,
      notificationTime,
    } = formState;
    const { resetForm } = formActions;
    const { events } = operationsState;
    const { saveEvent } = operationsActions;
    const { handleOverlap } = overlapActions;

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
      handleOverlap(overlapping);
    } else {
      await saveEvent(eventData);
      resetForm();
    }
  };

  return { addOrUpdateEvent };
};
