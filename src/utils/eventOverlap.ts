import { Event, EventForm } from '../types';

export function parseDateTime(date: string, time: string) {
  const parsedDate = new Date(`${date}T${time}`);

  // 잘못된 날짜를 받아도 Date 객체를 생성하기 때문에 getTime()으로 유효성 확인
  return isNaN(parsedDate.getTime()) ? 'Invalid Date' : parsedDate;
}

export function convertEventToDateRange({ date, startTime, endTime }: Event | EventForm) {
  return {
    start: parseDateTime(date, startTime),
    end: parseDateTime(date, endTime),
  };
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
