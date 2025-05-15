import { useMemo, useState } from 'react';

import type { CalendarView, Event } from '@/types';
import { getFilteredEvents } from '@/utils';

export const useSearch = (events: Event[], currentDate: Date, view: CalendarView) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = useMemo(() => {
    return getFilteredEvents(events, searchTerm, currentDate, view);
  }, [events, searchTerm, currentDate, view]);

  return {
    searchTerm,
    setSearchTerm,
    filteredEvents,
  };
};
