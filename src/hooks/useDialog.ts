import { useState } from 'react';

import { Event, EventForm } from '../types';
import { findOverlappingEvents } from '../utils/eventOverlap';

export const useDialog = () => {
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);

  const onOpen = () => {
    setIsOverlapDialogOpen(true);
  };

  const onClose = () => {
    setIsOverlapDialogOpen(false);
  };

  const checkOverlap = (eventData: Event | EventForm, events: Event[]) => {
    const overlapping = findOverlappingEvents(eventData, events);

    if (overlapping.length <= 0) {
      return false;
    }
    setOverlappingEvents(overlapping);
    setIsOverlapDialogOpen(true);
    return true;
  };

  return {
    isOpen: isOverlapDialogOpen,
    overlappingEvents,
    onOpen,
    onClose,
    checkOverlap,
  };
};
