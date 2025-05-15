// contexts/EventFormContext.tsx
import { createContext, useContext, ReactNode, useMemo } from 'react';

import { useEventForm } from '../../../hooks/useEventForm';

const ScheduleFormContext = createContext<ReturnType<typeof useEventForm> | null>(null);

export const ScheduleFormProvider = ({ children }: { children: ReactNode }) => {
  const eventFormState = useEventForm();

  const value = useMemo(() => eventFormState, [eventFormState]);

  return <ScheduleFormContext.Provider value={value}>{children}</ScheduleFormContext.Provider>;
};

export const useScheduleFormContext = () => {
  const context = useContext(ScheduleFormContext);
  if (!context) {
    throw new Error('useScheduleFormContext must be used within ScheduleFormProvider');
  }
  return context;
};
