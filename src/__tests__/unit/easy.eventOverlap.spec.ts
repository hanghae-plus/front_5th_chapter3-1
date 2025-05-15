import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../entities/event/lib/eventOverlap';
import { Event } from '../../entities/event/model/types';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const date = '2025-07-01';
    const time = '14:30';
    const expectedDate = new Date('2025-07-01T14:30:00');

    const result = parseDateTime(date, time);

    expect(result).toEqual(expectedDate);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const date = '2025-07-32';
    const time = '14:30';
    const expectedDate = new Date('Invalid Date');

    const result = parseDateTime(date, time);

    expect(result.toString()).toEqual(expectedDate.toString());
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const date = '2025-07-01';
    const time = '25:30';
    const expectedDate = new Date('Invalid Date');

    const result = parseDateTime(date, time);

    expect(result.toString()).toEqual(expectedDate.toString());
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const date = '';
    const time = '25:30';
    const expectedDate = new Date('Invalid Date');

    const result = parseDateTime(date, time);

    expect(result.toString()).toEqual(expectedDate.toString());
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event: Event = {
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
    };
    const expectedRange = {
      start: new Date('2025-07-01T14:30:00'),
      end: new Date('2025-07-01T15:30:00'),
    };

    expect(convertEventToDateRange(event)).toEqual(expectedRange);
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      date: '2025-07-32',
      startTime: '14:30',
      endTime: '15:30',
    };
    const expectedRange = {
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    };

    expect(convertEventToDateRange(event)).toEqual(expectedRange);
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      date: '2025-07-01',
      startTime: '25:30',
      endTime: '28:30',
    };
    const expectedRange = {
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    };

    expect(convertEventToDateRange(event)).toEqual(expectedRange);
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1: Event = {
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
    };
    const event2: Event = {
      date: '2025-07-01',
      startTime: '15:00',
      endTime: '16:00',
    };

    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1: Event = {
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
    };
    const event2: Event = {
      date: '2025-07-01',
      startTime: '15:30',
      endTime: '16:00',
    };

    expect(isOverlapping(event1, event2)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent: Event = {
      id: 1,
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
    };

    const events: Event[] = [
      {
        id: 2,
        date: '2025-07-01',
        startTime: '15:00',
        endTime: '16:00',
      },
      {
        id: 3,
        date: '2025-07-01',
        startTime: '16:00',
        endTime: '17:00',
      },
    ];

    const overlappingEvents = findOverlappingEvents(newEvent, events);
    expect(overlappingEvents).toEqual([events[0]]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: Event = {
      id: 1,
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
    };

    const events: Event[] = [
      {
        id: 2,
        date: '2025-07-01',
        startTime: '16:00',
        endTime: '17:00',
      },
    ];

    const overlappingEvents = findOverlappingEvents(newEvent, events);
    expect(overlappingEvents).toEqual([]);
  });
});
