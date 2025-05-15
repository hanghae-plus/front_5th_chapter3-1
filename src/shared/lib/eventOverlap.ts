import { Event, EventForm } from '../../types';

/**
 * Date 객체로 변환
 * @param date
 * @param time
 * @returns
 */
export function parseDateTime(date: string, time: string) {
  return new Date(`${date}T${time}`);
}

/**
 * 이벤트(Event 또는 EventForm) 객체에서 date, startTime, endTime을 받아서 start와 end라는 Date 객체 두 개를 반환합니다.
 * @param param0
 * @returns
 */
export function convertEventToDateRange({ date, startTime, endTime }: Event | EventForm) {
  return {
    start: parseDateTime(date, startTime),
    end: parseDateTime(date, endTime),
  };
}

/**
 * 이벤트 간 시간, 날짜 겹침(overlap) 여부를 판단하는 함수
 * @param event1
 * @param event2
 * @returns
 */
export function isOverlapping(event1: Event | EventForm, event2: Event | EventForm) {
  const { start: start1, end: end1 } = convertEventToDateRange(event1);
  const { start: start2, end: end2 } = convertEventToDateRange(event2);

  return start1 < end2 && start2 < end1;
}

/**
 * 이벤트 랩핑 필터링
 * @param newEvent
 * @param events
 * @returns
 */
export function findOverlappingEvents(newEvent: Event | EventForm, events: Event[]) {
  return events.filter(
    (event) => event.id !== (newEvent as Event).id && isOverlapping(event, newEvent)
  );
}
