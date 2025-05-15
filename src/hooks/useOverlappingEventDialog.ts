/* eslint-disable no-unused-vars */
import { useState } from 'react';

import { Event, EventForm } from '../types';
import {
  createClosedDialogState,
  createInitialDialogState,
  createOpenDialogState,
} from '../utils/dialogState';

interface UseOverlappingEventDialogProps {
  onConfirmSave: (event: Event | EventForm) => Promise<void>;
}

export const useOverlappingEventDialog = ({ onConfirmSave }: UseOverlappingEventDialogProps) => {
  const [dialogState, setDialogState] = useState(createInitialDialogState());

  const openDialog = (events: Event[], eventToSave: Event | EventForm) => {
    setDialogState(createOpenDialogState(events, eventToSave));
  };

  const closeDialog = () => {
    setDialogState(createClosedDialogState());
  };

  const confirm = async () => {
    if (dialogState.pendingEvent) {
      await onConfirmSave(dialogState.pendingEvent);
      closeDialog();
    }
  };

  return {
    isOpen: dialogState.isOpen,
    overlappingEvents: dialogState.overlappingEvents,
    openDialog,
    closeDialog,
    confirm,
  };
};
