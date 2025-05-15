// src/hooks/useOverlapState.ts
import { useState } from 'react';

import { useDialogStore } from '../../../based/store/DialogStore';
import { Event } from '../../../types';

export const useOverlapStateAndActions = () => {
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const { isOverlapDialogOpen, setIsOverlapDialogOpen } = useDialogStore();

  const handleOverlap = (events: Event[]) => {
    setOverlappingEvents(events);
    setIsOverlapDialogOpen(true);
  };

  const closeOverlapDialog = () => {
    setIsOverlapDialogOpen(false);
    setOverlappingEvents([]);
  };

  return {
    overlapState: {
      overlappingEvents,
      isOverlapDialogOpen,
    },
    overlapActions: {
      handleOverlap,
      closeOverlapDialog,
    },
  };
};
