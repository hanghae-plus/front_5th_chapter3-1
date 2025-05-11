import { Event, EventForm } from '../types';

/**
 * 주어진 날짜와 시간을 Date 객체로 변환합니다.
 * 날짜 문자열이 비어있거나 시간 문자열이 비어있으면 Invalid Date를 반환합니다.
 */
export function parseDateTime(date: string, time: string) {
  return new Date(`${date}T${time}`);
}

/**
 * 주어진 이벤트 또는 이벤트 폼을 날짜 범위로 변환합니다.
 * 잘못된 날짜 형식이나 시간 형식이면 Invalid Date를 반환합니다.
 */
export function convertEventToDateRange({ date, startTime, endTime }: Event | EventForm) {
  return {
    start: parseDateTime(date, startTime),
    end: parseDateTime(date, endTime),
  };
}

/**
 * 두 이벤트가 겹치는지 확인합니다.
 */
export function isOverlapping(event1: Event | EventForm, event2: Event | EventForm) {
  const { start: start1, end: end1 } = convertEventToDateRange(event1);
  const { start: start2, end: end2 } = convertEventToDateRange(event2);

  return start1 < end2 && start2 < end1;
}

/**
 * 주어진 이벤트와 겹치는 모든 이벤트를 찾습니다.
 */
export function findOverlappingEvents(newEvent: Event | EventForm, events: Event[]) {
  return events.filter(
    (event) => event.id !== (newEvent as Event).id && isOverlapping(event, newEvent)
  );
}
