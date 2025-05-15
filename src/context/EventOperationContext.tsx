import { createContext, ReactNode, useContext } from 'react';

import { useEventFormContext } from './EventContext';
import { useEventOperations } from '../hooks/useEventOperations';

export const EventOperationContext = createContext<ReturnType<typeof useEventOperations>>(null!);

export function EventOperationProvider({ children }: { children: ReactNode }) {
  const { setEditingEvent, editingEvent } = useEventFormContext();
  const eventOperations = useEventOperations(Boolean(editingEvent), () => setEditingEvent(null));
  return (
    <EventOperationContext.Provider value={eventOperations}>
      {children}
    </EventOperationContext.Provider>
  );
}

export function useEventOperationContext() {
  return useContext(EventOperationContext);
}
