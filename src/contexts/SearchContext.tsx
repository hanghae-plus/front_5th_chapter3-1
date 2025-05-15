import { createContext, useContext, ReactNode } from 'react';

import { useCalendarContext } from './CalendarContext';
import { useEventOperationsContext } from './EventOperationsContext';
import { useSearch, UseSearchReturn } from '../hooks/useSearch';

const SearchContext = createContext<UseSearchReturn | undefined>(undefined);

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const { events } = useEventOperationsContext();
  const { currentDate, view } = useCalendarContext();
  const search = useSearch(events, currentDate, view);
  return <SearchContext.Provider value={search}>{children}</SearchContext.Provider>;
};

export const useSearchContext = (): UseSearchReturn => {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearchContext must be used within SearchProvider');
  return ctx;
};
