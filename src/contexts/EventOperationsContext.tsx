import { createContext, useContext, ReactNode } from 'react';

import { useEventFormContext } from './EventFormContext';
import { useEventOperations, UseEventOperationsReturn } from '../hooks/useEventOperations';

const EventOperationsContext = createContext<UseEventOperationsReturn | undefined>(undefined);

export const EventOperationsProvider = ({ children }: { children: ReactNode }) => {
  const { editingEvent, setEditingEvent } = useEventFormContext();
  const ops = useEventOperations(Boolean(editingEvent), () => setEditingEvent(null));
  return <EventOperationsContext.Provider value={ops}>{children}</EventOperationsContext.Provider>;
};

export const useEventOperationsContext = (): UseEventOperationsReturn => {
  const ctx = useContext(EventOperationsContext);
  if (!ctx)
    throw new Error('useEventOperationsContext must be used within EventOperationsProvider');
  return ctx;
};
