import { Event, EventForm } from '../types';

export function parseDateTime(date: string, time: string) {
  return new Date(`${date}T${time}`);
}

// 이벤트 시작 시간과 종료 시간을 파싱하여 반환
export function convertEventToDateRange(event: Pick<EventForm, 'date' | 'startTime' | 'endTime'>) {
  return {
    start: parseDateTime(event.date, event.startTime),
    end: parseDateTime(event.date, event.endTime),
  };
}
type EventTimeInfo = Pick<EventForm, 'date' | 'startTime' | 'endTime'>;
export function isOverlapping(event1: EventTimeInfo, event2: EventTimeInfo) {
  const { start: start1, end: end1 } = convertEventToDateRange(event1);
  const { start: start2, end: end2 } = convertEventToDateRange(event2);

  return start1 < end2 && start2 < end1;
}
type EventLike = Pick<EventForm, 'date' | 'startTime' | 'endTime'> & Partial<Pick<Event, 'id'>>;
// 새 이벤트와 겹치는 모든 이벤트를 반환
export function findOverlappingEvents(newEvent: EventLike, events: EventLike[]) {
  return events.filter(
    (event) => event.id !== (newEvent as Event).id && isOverlapping(event, newEvent)
  );
}
