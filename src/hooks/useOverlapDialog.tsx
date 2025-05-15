import { useCallback, useState } from 'react';

import { OverlapDialog } from '../components/OverlapDialog';
import { Event } from '../types';
import { useEventOperations } from './useEventOperations';
import { useEventFormContext } from '../contexts/EventFormContext';

export const useOverlapDialog = () => {
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);

  const { editingEvent, ...formState } = useEventFormContext();
  const { saveEvent } = useEventOperations();

  const handleProceed = useCallback(() => {
    setIsOverlapDialogOpen(false);
    saveEvent({
      id: editingEvent ? editingEvent.id : undefined,
      title: formState.title,
      date: formState.date,
      startTime: formState.startTime,
      endTime: formState.endTime,
      description: formState.endTime,
      location: formState.location,
      category: formState.category,
      repeat: {
        type: formState.isRepeating ? formState.repeatType : 'none',
        interval: formState.repeatInterval,
        endDate: formState.repeatEndDate || undefined,
      },
      notificationTime: formState.notificationTime,
    });
  }, [editingEvent, formState, saveEvent]);

  const openOverlapDialog = (overlapEvents: Event[]) => {
    setOverlappingEvents(overlapEvents);
    setIsOverlapDialogOpen(true);
  };

  const OverlapDialogCallback = useCallback(
    () => (
      <OverlapDialog
        overlappingEvents={overlappingEvents}
        isOverlapDialogOpen={isOverlapDialogOpen}
        setIsOverlapDialogOpen={setIsOverlapDialogOpen}
        onProceed={handleProceed}
      />
    ),
    [isOverlapDialogOpen, overlappingEvents, handleProceed]
  );

  return {
    openOverlapDialog,
    OverlapDialog: OverlapDialogCallback,
  };
};
