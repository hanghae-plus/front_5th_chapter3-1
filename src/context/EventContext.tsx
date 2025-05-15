import { createContext, ReactNode, useContext } from 'react';

import { useEventForm } from '../hooks/useEventForm';

// EventContext.tsx
const EventContext = createContext<ReturnType<typeof useEventForm>>(null!);

export function EventProvider({ children }: { children: ReactNode }) {
  const event = useEventForm();
  return <EventContext.Provider value={event}>{children}</EventContext.Provider>;
}

export function useEventFormContext() {
  return useContext(EventContext);
}
