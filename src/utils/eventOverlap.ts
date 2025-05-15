import { Event, EventForm } from '../types';

/**
 * 주어진 날짜와 시간을 Date 객체로 변환합니다.
 *
 * @example
 * parseDateTime('2025-07-01', '14:30') // new Date('2025-07-01T14:30:00')
 * parseDateTime('', '') // new Date('Invalid Date')
 */
export const parseDateTime = (date: string, time: string) => {
  return new Date(`${date}T${time}`);
};

/**
 * 주어진 이벤트의 시작 및 종료 시간을 Date 객체로 변환합니다.
 *
 * @example
 * convertEventToDateRange({ date: '2025-07-01', startTime: '14:30', endTime: '15:30' }) // { start: new Date('2025-07-01T14:30:00'), end: new Date('2025-07-01T15:30:00') }
 * convertEventToDateRange({ date: 'Invalid Date', startTime: '14:30', endTime: '15:30' }) // { start: new Date('Invalid Date'), end: new Date('Invalid Date') }
 */
export const convertEventToDateRange = ({ date, startTime, endTime }: Event | EventForm) => {
  return {
    start: parseDateTime(date, startTime),
    end: parseDateTime(date, endTime),
  };
};

/**
 * 두 이벤트가 겹치는지 확인합니다.
 *
 * @example
 * isOverlapping({ date: '2025-07-01', startTime: '14:30', endTime: '15:30' }, { date: '2025-07-01', startTime: '15:30', endTime: '16:30' }) // true
 * isOverlapping({ date: '2025-07-01', startTime: '14:30', endTime: '15:30' }, { date: '2025-07-01', startTime: '16:30', endTime: '17:30' }) // false
 */
export const isOverlapping = (event1: Event | EventForm, event2: Event | EventForm) => {
  const { start: start1, end: end1 } = convertEventToDateRange(event1);
  const { start: start2, end: end2 } = convertEventToDateRange(event2);

  return start1 < end2 && start2 < end1;
};

/**
 * 새 이벤트와 겹치는 모든 이벤트를 반환합니다.
 *
 * @example
 * findOverlappingEvents({ date: '2025-07-01', startTime: '14:30', endTime: '15:30' }, [{ date: '2025-07-01', startTime: '14:30', endTime: '15:30' }]) // [{ date: '2025-07-01', startTime: '14:30', endTime: '15:30' }]
 */
export const findOverlappingEvents = (newEvent: Event | EventForm, events: Event[]) => {
  return events.filter(
    (event) => event.id !== (newEvent as Event).id && isOverlapping(event, newEvent)
  );
};
