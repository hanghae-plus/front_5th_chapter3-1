import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2025-05-12 14:30을 정확한 Date 객체로 변환한다', () => {
    const dateTime = parseDateTime('2025-05-12', '14:30');

    expect(dateTime).toBeInstanceOf(Date);
    expect(dateTime.toISOString()).toBe('2025-05-12T14:30:00.000Z'); // 시간대 UTC 설정
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const dateTime = parseDateTime('invalid-date', '10:00');
    expect(dateTime.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const dateTime = parseDateTime('2025-05-12', 'invalid-time');
    expect(dateTime.toString()).toBe('Invalid Date');
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const dateTime = parseDateTime('', '10:00');
    expect(dateTime.toString()).toBe('Invalid Date');
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event: Event = {
      id: '1',
      title: '이벤트',
      date: '2025-05-12',
      startTime: '14:30',
      endTime: '15:30',
      description: '이벤트 설명',
      location: '이벤트 장소',
      category: '카테고리',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };

    const dateRange = convertEventToDateRange(event);

    expect(dateRange.start).toBeInstanceOf(Date);
    expect(dateRange.start.toISOString()).toBe('2025-05-12T14:30:00.000Z');
    expect(dateRange.end).toBeInstanceOf(Date);
    expect(dateRange.end.toISOString()).toBe('2025-05-12T15:30:00.000Z');
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const wrongDatevent: Event = {
      id: '1',
      title: '이벤트',
      date: 'invalid-date',
      startTime: '14:30',
      endTime: '15:30',
      description: '이벤트 설명',
      location: '이벤트 장소',
      category: '카테고리',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };

    const dateRange = convertEventToDateRange(wrongDatevent);

    expect(dateRange.start.toString()).toBe('Invalid Date');
    expect(dateRange.end.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const wrongTimevent: Event = {
      id: '1',
      title: '이벤트',
      date: '2025-05-12',
      startTime: 'invalid-time',
      endTime: '15:30',
      description: '이벤트 설명',
      location: '이벤트 장소',
      category: '카테고리',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };

    const dateRange = convertEventToDateRange(wrongTimevent);

    expect(dateRange.start.toString()).toBe('Invalid Date');
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1: Event = {
      id: '1',
      title: '이벤트1',
      date: '2024-05-12',
      startTime: '14:30',
      endTime: '15:30',
      description: '이벤트 설명',
      location: '이벤트 장소',
      category: '카테고리',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };

    const event2: Event = {
      id: '2',
      title: '이벤트2',
      date: '2024-05-12',
      startTime: '15:00',
      endTime: '16:00',
      description: '이벤트 설명',
      location: '이벤트 장소',
      category: '카테고리',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };

    const result = isOverlapping(event1, event2);

    expect(result).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1: Event = {
      id: '1',
      title: '이벤트1',
      date: '2024-05-12',
      startTime: '14:30',
      endTime: '15:30',
      description: '이벤트 설명',
      location: '이벤트 장소',
      category: '카테고리',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const event2: Event = {
      id: '2',
      title: '이벤트2',
      date: '2024-05-12',
      startTime: '15:30',
      endTime: '16:30',
      description: '이벤트 설명',
      location: '이벤트 장소',
      category: '카테고리',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };

    const result = isOverlapping(event1, event2);

    expect(result).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent: Event = {
      id: '1',
      title: '이벤트',
      date: '2024-05-12',
      startTime: '14:30',
      endTime: '16:30',
      description: '이벤트 설명',
      location: '이벤트 장소',
      category: '카테고리',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const events: Event[] = [
      {
        id: '2',
        title: '이벤트2',
        date: '2024-05-12',
        startTime: '14:00',
        endTime: '15:00',
        description: '이벤트 설명',
        location: '이벤트 장소',
        category: '카테고리',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '3',
        title: '이벤트3',
        date: '2024-05-12',
        startTime: '15:30',
        endTime: '16:30',
        description: '이벤트 설명',
        location: '이벤트 장소',
        category: '카테고리',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ];

    const overlappedEvents = findOverlappingEvents(newEvent, events);

    expect(overlappedEvents).toEqual(events);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: Event = {
      id: '1',
      title: '이벤트',
      date: '2024-05-12',
      startTime: '14:30',
      endTime: '15:30',
      description: '이벤트 설명',
      location: '이벤트 장소',
      category: '카테고리',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const events: Event[] = [
      {
        id: '2',
        title: '이벤트2',
        date: '2024-05-12',
        startTime: '15:30',
        endTime: '16:30',
        description: '이벤트 설명',
        location: '이벤트 장소',
        category: '카테고리',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ];

    const overlappedEvents = findOverlappingEvents(newEvent, events);

    expect(overlappedEvents).toEqual([]);
  });
});
