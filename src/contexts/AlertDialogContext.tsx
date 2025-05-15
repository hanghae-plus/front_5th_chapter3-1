import { createContext, useContext, useState, ReactNode } from 'react';

import { Event, EventForm } from '../types';

interface AlertDialogContextValue {
  isOpen: boolean;
  overlappingEvents: Event[];
  pendingEvent: Event | EventForm | null;
  // eslint-disable-next-line no-unused-vars
  openDialog: (pending: Event | EventForm, overlapping: Event[]) => void;
  closeDialog: () => void;
}

const AlertDialogContext = createContext<AlertDialogContextValue | undefined>(undefined);

export const AlertDialogProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const [pendingEvent, setPendingEvent] = useState<Event | EventForm | null>(null);

  const openDialog = (pending: Event | EventForm, overlapping: Event[]) => {
    setPendingEvent(pending);
    setOverlappingEvents(overlapping);
    setIsOpen(true);
  };
  const closeDialog = () => {
    setIsOpen(false);
    setOverlappingEvents([]);
    setPendingEvent(null);
  };

  return (
    <AlertDialogContext.Provider
      value={{ isOpen, overlappingEvents, pendingEvent, openDialog, closeDialog }}
    >
      {children}
    </AlertDialogContext.Provider>
  );
};

export const useAlertDialogContext = () => {
  const ctx = useContext(AlertDialogContext);
  if (!ctx) throw new Error('useAlertDialogContext must be inside AlertDialogProvider');
  return ctx;
};
