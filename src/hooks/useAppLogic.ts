import { useToast } from '@chakra-ui/react';

import { useEventForm } from '../hooks/useEventForm';
import { useEventOperations } from '../hooks/useEventOperations';
import { useOverlapDetection } from '../hooks/useOverlapDetection';
import { Event, EventForm as EventFormDataType } from '../types';
import { createEventToasts } from '../utils/toastUtils';

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

  const toast = useToast();
  const { showErrorToast } = createEventToasts(toast);

  const {
    isOverlapDialogOpen,
    setIsOverlapDialogOpen,
    overlappingEvents,
    cancelRef,
    checkEventOverlap,
  } = useOverlapDetection({ events });

  const addOrUpdateEvent = async () => {
    if (!title || !date || !startTime || !endTime) {
      showErrorToast('필수 정보를 모두 입력해주세요.');
      return;
    }

    if (startTimeError || endTimeError) {
      showErrorToast('시간 설정을 확인해주세요.');
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

    const hasOverlap = checkEventOverlap(eventData, editingEvent?.id);

    if (!hasOverlap) {
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
