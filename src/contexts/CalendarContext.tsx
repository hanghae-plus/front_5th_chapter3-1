import { createContext, useContext, ReactNode } from 'react';

import { useCalendarView, UseCalendarViewReturn } from '../hooks/useCalendarView';

const CalendarContext = createContext<UseCalendarViewReturn | undefined>(undefined);

export const CalendarProvider = ({ children }: { children: ReactNode }) => {
  const calendar = useCalendarView();
  return <CalendarContext.Provider value={calendar}>{children}</CalendarContext.Provider>;
};

export const useCalendarContext = (): UseCalendarViewReturn => {
  const ctx = useContext(CalendarContext);
  if (!ctx) throw new Error('useCalendarContext must be used within CalendarProvider');
  return ctx;
};
