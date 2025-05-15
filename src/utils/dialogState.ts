import { Event, EventForm } from '../types';

export interface DialogState {
  isOpen: boolean;
  overlappingEvents: Event[];
  pendingEvent: Event | EventForm | null;
}

export const createInitialDialogState = (): DialogState => ({
  isOpen: false,
  overlappingEvents: [],
  pendingEvent: null,
});

export const createOpenDialogState = (
  events: Event[],
  eventToSave: Event | EventForm
): DialogState => ({
  isOpen: true,
  overlappingEvents: events,
  pendingEvent: eventToSave,
});

export const createClosedDialogState = (): DialogState => ({
  isOpen: false,
  overlappingEvents: [],
  pendingEvent: null,
});
