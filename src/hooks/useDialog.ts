import { useState } from 'react';

import { Event } from '@/types';

export const useDialog = () => {
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);

  return {
    isOverlapDialogOpen,
    setIsOverlapDialogOpen,
    overlappingEvents,
    setOverlappingEvents,
  };
};
