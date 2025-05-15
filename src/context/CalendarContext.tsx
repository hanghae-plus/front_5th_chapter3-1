import { createContext, ReactNode, useContext } from 'react';

import { useCalendarView } from '../hooks/useCalendarView';

export const CalendarContext = createContext<ReturnType<typeof useCalendarView>>(null!);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const calendar = useCalendarView();
  return <CalendarContext.Provider value={calendar}>{children}</CalendarContext.Provider>;
}

export const useCalendarContext = () => {
  return useContext(CalendarContext);
};
