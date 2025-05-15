import { createContext, ReactNode, useContext } from 'react';

import { useCalendarContext } from './CalendarContext';
import { useEventOperationContext } from './EventOperationContext';
import { useSearch } from '../hooks/useSearch';

export const SearchContext = createContext<ReturnType<typeof useSearch>>(null!);

export function SearchProvider({ children }: { children: ReactNode }) {
  const { events } = useEventOperationContext();
  const { currentDate, view } = useCalendarContext();
  const search = useSearch(events, currentDate, view);
  return <SearchContext.Provider value={search}>{children}</SearchContext.Provider>;
}

export function useSearchContext() {
  return useContext(SearchContext);
}
