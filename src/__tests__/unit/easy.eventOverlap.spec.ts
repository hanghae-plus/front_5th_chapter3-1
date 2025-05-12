import eventsData from '../../__mocks__/response/events.json';
import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const date = '2025-07-01';
    const time = '14:30';
    const result = parseDateTime(date, time);
    expect(result).toEqual(new Date('2025-07-01T14:30:00'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const date = '14:30';
    const time = '14:30';
    const result = parseDateTime(date, time);
    expect(result).toEqual(new Date('Invalid Date'));
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const date = '2025-07-01';
    const time = '2025-07-01';
    const result = parseDateTime(date, time);
    expect(result).toEqual(new Date('Invalid Date'));
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const date = '';
    const time = '14:30';
    const result = parseDateTime(date, time);
    expect(result).toEqual(new Date('Invalid Date'));
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event = eventsData.events[0] as Event;
    const result = convertEventToDateRange(event);
    expect(result).toEqual({
      start: new Date('2025-07-01T09:00:00'),
      end: new Date('2025-07-01T10:00:00'),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = eventsData.events[0] as Event;
    const invalidEvent = { ...event, date: '9999-99-99' } as Event;
    const result = convertEventToDateRange(invalidEvent);
    expect(result).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = eventsData.events[0] as Event;
    const invalidEvent = { ...event, startTime: '99:60', endTime: '99:99' } as Event;
    const result = convertEventToDateRange(invalidEvent);
    expect(result).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1 = eventsData.events[0] as Event;
    const event2 = { ...eventsData.events[1], date: '2025-07-01' } as Event;
    const result = isOverlapping(event1, event2);
    expect(result).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1 = eventsData.events[0] as Event;
    const event2 = eventsData.events[1] as Event;
    const result = isOverlapping(event1, event2);
    expect(result).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent = { ...eventsData.events[0], id: '999' } as Event;
    const events = eventsData.events as Event[];
    const result = findOverlappingEvents(newEvent, events);
    expect(result).toEqual([eventsData.events[0]]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent = { ...eventsData.events[0], date: '2025-06-01', id: '999' } as Event;
    const events = eventsData.events as Event[];
    const result = findOverlappingEvents(newEvent, events);
    expect(result).toEqual([]);
  });
});
