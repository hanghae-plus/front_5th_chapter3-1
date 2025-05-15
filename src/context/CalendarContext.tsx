import { createContext, useContext, ReactNode, Dispatch, SetStateAction } from 'react';

import { useCalendarView } from '../hooks/useCalendarView';

export interface CalendarContextType {
  view: 'week' | 'month';
  setView: Dispatch<SetStateAction<'week' | 'month'>>;
  currentDate: Date;
  setCurrentDate: Dispatch<SetStateAction<Date>>;
  holidays: { [key: string]: string };
  // eslint-disable-next-line no-unused-vars
  navigate: (direction: 'prev' | 'next') => void;
}

const CalendarContext = createContext<CalendarContextType | null>(null);

export const CalendarProvider = ({ children }: { children: ReactNode }) => {
  const value = useCalendarView();

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
};

export const useCalendarContext = () => {
  const context = useContext(CalendarContext);

  if (!context) {
    throw new Error('useCalendarContext must be used within a CalendarProvider');
  }

  return context;
};
