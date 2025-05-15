import { createContext, useContext, ReactNode } from 'react';

import { useEventForm, UseEventFormReturn } from '../hooks/useEventForm';

const EventFormContext = createContext<UseEventFormReturn | undefined>(undefined);

export const EventFormProvider = ({ children }: { children: ReactNode }) => {
  const eventForm = useEventForm();
  return <EventFormContext.Provider value={eventForm}>{children}</EventFormContext.Provider>;
};

export const useEventFormContext = (): UseEventFormReturn => {
  const ctx = useContext(EventFormContext);
  if (!ctx) throw new Error('useEventFormContext must be used within EventFormProvider');
  return ctx;
};
