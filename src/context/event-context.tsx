/* eslint-disable no-unused-vars */
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react';

import { useEventOperations } from '../hooks/useEventOperations';
import { useNotifications } from '../hooks/useNotifications';
import { useSearch } from '../hooks/useSearch';
import { Event, EventForm } from '../types';

interface EventContextType {
  events: Event[];
  filteredEvents: Event[];
  notifiedEvents: string[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  saveEvent: (eventData: Event | EventForm) => Promise<void>;
  deleteEvent: (id: string) => void;
  notifications: { message: string }[];
  setNotifications: Dispatch<SetStateAction<{ id: string; message: string }[]>>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const useEventContext = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
};

interface EventProviderProps {
  children: ReactNode;
  initialDate: Date;
  initialView: 'week' | 'month';
}

export const EventProvider = ({ children, initialDate, initialView }: EventProviderProps) => {
  const { events, saveEvent, deleteEvent } = useEventOperations(() => {});
  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, initialDate, initialView);

  return (
    <EventContext.Provider
      value={{
        events,
        filteredEvents,
        notifiedEvents,
        searchTerm,
        setSearchTerm,
        saveEvent,
        deleteEvent,
        notifications,
        setNotifications,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};
