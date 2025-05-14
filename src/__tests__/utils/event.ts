import type { Event } from '../../types';
import { EVENT, EVENT_CATEGORIES, REPEAT_TYPES } from '../constants';

export const makeEvents = (count = 2): Event[] =>
  Array(count)
    .fill(null)
    .map((_, index) => {
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + index);
      const formattedDate = eventDate.toISOString().split('T')[0];

      return {
        id: String(index + 1),
        title: `${index + 1}-` + EVENT.title,
        description: `${index + 1}-` + EVENT.description,
        date: formattedDate, // 수정된 날짜 사용
        startTime: EVENT.startTime,
        endTime: EVENT.endTime,
        location: `${index + 1}-` + EVENT.location,
        category: EVENT_CATEGORIES[index % EVENT_CATEGORIES.length],
        notificationTime: EVENT.notificationTime,
        repeat: {
          type: REPEAT_TYPES[index % REPEAT_TYPES.length],
          interval: 1,
          endDate: `${index + 1}-` + EVENT.repeat.endDate,
        },
      };
    });
