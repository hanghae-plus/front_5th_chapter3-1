// features/search/lib/searchUtils.ts

import { Event } from '../../../entities/event/model/types';

export const filterEvents = (
  events: Event[],
  searchTerm: string,
  currentDate: Date,
  view: 'week' | 'month'
) => {
  return events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase());

    // 현재 view에 따른 날짜 필터링 로직
    const eventDate = new Date(event.date);
    if (view === 'week') {
      // 주간 view 필터링 로직
    } else {
      // 월간 view 필터링 로직
    }
    return matchesSearch;
  });
};
