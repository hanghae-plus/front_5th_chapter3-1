import { useState } from 'react';

import { Event } from '../types';

export const useOverlappingEvent = () => {
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);

  return {
    isOverlapDialogOpen,
    overlappingEvents,
    setOverlappingEvents,
    setIsOverlapDialogOpen,
  };
};
