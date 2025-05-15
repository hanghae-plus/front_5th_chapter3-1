/* eslint-disable no-unused-vars */
import { Event, EventForm } from '@/entities/event/model/types';

export interface EventOperationsContextType {
  events: Event[];
  fetchEvents: () => Promise<void>;
  saveEvent: (eventData: Event | EventForm) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}
