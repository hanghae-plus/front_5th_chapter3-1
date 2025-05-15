// src/app/providers/EventProvider.tsx
import React, { createContext, useContext, useState } from 'react';

import { Event } from '@/types';

const EventContext = createContext<{
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
} | null>(null);

export const EventProvider = ({ children }: { children: React.ReactNode }) => {
  const [events, setEvents] = useState<Event[]>([]);
  return <EventContext.Provider value={{ events, setEvents }}>{children}</EventContext.Provider>;
};

export const useEventContext = () => {
  const context = useContext(EventContext);
  if (!context) throw new Error('useEventContext must be used within EventProvider');
  return context;
};
