import { Event, EventForm } from '../types';

export function parseDateTime(date: string, time: string) {
  return new Date(`${date}T${time}`);
}

export function convertEventToDateRange({ date, startTime, endTime }: Event | EventForm) {
  const start = parseDateTime(date, startTime);
  const end = parseDateTime(date, endTime);

  // 둘 중 하나라도 Invalid Date면 둘 다 Invalid Date로 반환
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return {
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    };
  }

  return { start, end };
}

export function isOverlapping(event1: Event | EventForm, event2: Event | EventForm) {
  const { start: start1, end: end1 } = convertEventToDateRange(event1);
  const { start: start2, end: end2 } = convertEventToDateRange(event2);

  return start1 < end2 && start2 < end1;
}

export function findOverlappingEvents(newEvent: Event | EventForm, events: Event[]) {
  return events.filter(
    (event) => event.id !== (newEvent as Event).id && isOverlapping(event, newEvent)
  );
}
