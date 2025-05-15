import { useMemo, useState } from 'react';

import { Event } from '../../types';
import { getFilteredEvents } from '../lib/eventUtils';

/**
 * 검색어 관련 event
 * @param events
 * @param currentDate
 * @param view
 * @returns
 */
export const useSearch = (events: Event[], currentDate: Date, view: 'week' | 'month') => {
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
