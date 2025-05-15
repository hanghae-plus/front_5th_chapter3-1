//  날짜별 이벤트 캐싱

import { useMemo } from 'react';

import { Event } from '@/types';

export const useEventsByDate = (events: Event[]) => {
  return useMemo(() => {
    const map: Record<string, Event[]> = {};
    events.forEach((event) => {
      const dateKey = event.date; // ISO string like "2025-07-01"
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(event);
    });
    return map;
  }, [events]);
};
