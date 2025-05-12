import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';
import { createEvent } from '../fixtures/events';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const date = '2025-07-01';
    const time = '14:30';
    const parsedDate = parseDateTime(date, time);

    expect(parsedDate).toBeInstanceOf(Date);
    expect(parsedDate.getFullYear()).toBe(2025);
    expect(parsedDate.getMonth()).toBe(6);
    expect(parsedDate.getDate()).toBe(1);
    expect(parsedDate.getHours()).toBe(14);
    expect(parsedDate.getMinutes()).toBe(30);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const date = 'invalid-date';
    const time = '14:30';
    const parsedDate = parseDateTime(date, time);

    expect(parsedDate.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const date = '2025-07-01';
    const time = 'invalid-time';
    const parsedDate = parseDateTime(date, time);

    expect(parsedDate.toString()).toBe('Invalid Date');
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const date = '';
    const time = '14:30';
    const parsedDate = parseDateTime(date, time);

    expect(parsedDate.toString()).toBe('Invalid Date');
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event = createEvent({
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:30',
    });

    const dateRange = convertEventToDateRange(event);

    expect(dateRange.start).toBeInstanceOf(Date);
    expect(dateRange.end).toBeInstanceOf(Date);
    expect(dateRange.start.getHours()).toBe(9);
    expect(dateRange.start.getMinutes()).toBe(0);
    expect(dateRange.end.getHours()).toBe(10);
    expect(dateRange.end.getMinutes()).toBe(30);
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = createEvent({
      date: 'invalid-date',
      startTime: '09:00',
      endTime: '10:30',
    });

    const dateRange = convertEventToDateRange(event);

    expect(dateRange.start.toString()).toBe('Invalid Date');
    expect(dateRange.end.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = createEvent({
      date: '2025-07-01',
      startTime: 'invalid-time',
      endTime: '10:30',
    });

    const dateRange = convertEventToDateRange(event);

    expect(dateRange.start.toString()).toBe('Invalid Date');
    expect(dateRange.end.toString()).not.toBe('Invalid Date');
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1 = createEvent({
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '11:00',
    });

    const event2 = createEvent({
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '12:00',
    });

    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1 = createEvent({
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
    });

    const event2 = createEvent({
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
    });

    expect(isOverlapping(event1, event2)).toBe(false);
  });

  it('두 이벤트가 다른 날짜에 있을 경우 false를 반환한다', () => {
    const event1 = createEvent({
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '11:00',
    });

    const event2 = createEvent({
      date: '2025-07-02',
      startTime: '09:00',
      endTime: '11:00',
    });

    expect(isOverlapping(event1, event2)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const existingEvents: Event[] = [
      createEvent({
        id: '1',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
      }),
      createEvent({
        id: '2',
        date: '2025-07-01',
        startTime: '10:30',
        endTime: '11:30',
      }),
      createEvent({
        id: '3',
        date: '2025-07-01',
        startTime: '11:00',
        endTime: '12:00',
      }),
    ];

    const newEvent = createEvent({
      id: '4',
      date: '2025-07-01',
      startTime: '10:45',
      endTime: '11:45',
    });

    const overlappingEvents = findOverlappingEvents(newEvent, existingEvents);

    expect(overlappingEvents).toHaveLength(2);
    expect(overlappingEvents.map((e) => e.id)).toContain('2');
    expect(overlappingEvents.map((e) => e.id)).toContain('3');
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const existingEvents: Event[] = [
      createEvent({
        id: '1',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
      }),
      createEvent({
        id: '2',
        date: '2025-07-01',
        startTime: '12:00',
        endTime: '13:00',
      }),
    ];

    const newEvent = createEvent({
      id: '3',
      date: '2025-07-01',
      startTime: '10:30',
      endTime: '11:30',
    });

    const overlappingEvents = findOverlappingEvents(newEvent, existingEvents);

    expect(overlappingEvents).toHaveLength(0);
  });

  it('자기 자신과는 겹치지 않는 것으로 처리한다', () => {
    const existingEvents: Event[] = [
      createEvent({
        id: '1',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
      }),
      createEvent({
        id: '2',
        date: '2025-07-01',
        startTime: '10:30',
        endTime: '11:30',
      }),
    ];

    const sameEvent = {
      ...existingEvents[0],
    };

    const overlappingEvents = findOverlappingEvents(sameEvent, existingEvents);

    expect(overlappingEvents).toHaveLength(0);
  });
});
