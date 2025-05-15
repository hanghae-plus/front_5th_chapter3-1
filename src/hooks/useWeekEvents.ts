import { Event } from '@/types';

export const useWeekEvents = (filteredEvents: Event[], notifiedEvents: string[]) => {
  const getEventsForDate = (date: Date) => {
    return filteredEvents
      .filter((event) => new Date(event.date).toDateString() === date.toDateString())
      .map((event) => ({
        ...event,
        isNotified: notifiedEvents.includes(event.id),
      }));
  };

  return { getEventsForDate };
};
