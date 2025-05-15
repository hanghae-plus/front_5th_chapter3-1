import { RefObject, useRef, useState } from 'react';
import { Event } from '@/types';

interface UseDialogReturn {
  isOverlapDialogOpen: boolean;
  overlappingEvents: Event[];
  cancelRef: RefObject<HTMLButtonElement>;
  openDialog: (events: Event[]) => void;
  closeDialog: () => void;
}

export const useDialog = (): UseDialogReturn => {
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const openDialog = (events: Event[]) => {
    setOverlappingEvents(events);
    setIsOverlapDialogOpen(true);
  };

  const closeDialog = () => {
    setIsOverlapDialogOpen(false);
  };

  return {
    isOverlapDialogOpen,
    overlappingEvents,
    cancelRef,
    openDialog,
    closeDialog,
  };
};
