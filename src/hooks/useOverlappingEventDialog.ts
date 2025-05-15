/* eslint-disable no-unused-vars */
import { useState } from 'react';

import { Event, EventForm } from '../types';

interface UseOverlappingEventDialogProps {
  onConfirmSave: (event: Event | EventForm) => Promise<void>;
}

export const useOverlappingEventDialog = ({ onConfirmSave }: UseOverlappingEventDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const [pendingEvent, setPendingEvent] = useState<Event | EventForm | null>(null);

  const openDialog = (events: Event[], eventToSave: Event | EventForm) => {
    setOverlappingEvents(events);
    setPendingEvent(eventToSave);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setOverlappingEvents([]);
    setPendingEvent(null);
  };

  const confirm = async () => {
    if (pendingEvent) {
      await onConfirmSave(pendingEvent);
      closeDialog();
    }
  };

  return {
    isOpen,
    overlappingEvents,
    openDialog,
    closeDialog,
    confirm,
  };
};
