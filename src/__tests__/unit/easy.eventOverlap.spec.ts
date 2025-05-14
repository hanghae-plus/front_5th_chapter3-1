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
    const expectedDate = new Date('2025-07-01T14:30:00');

    const result = parseDateTime(date, time);

    expect(result).toEqual(expectedDate);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const date = '2025-07-32'; // 잘못된 날짜
    const time = '14:30';
    const expectedDate = new Date('Invalid Date');

    const result = parseDateTime(date, time);

    expect(result.toString()).toEqual(expectedDate.toString());
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const date = '2025-07-01';
    const time = '25:30'; // 잘못된 시간
    const expectedDate = new Date('Invalid Date');

    const result = parseDateTime(date, time);

    expect(result.toString()).toEqual(expectedDate.toString());
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const date = ''; // 비어있는 날짜
    const time = '14:30';
    const expectedDate = new Date('Invalid Date');

    const result = parseDateTime(date, time);

    expect(result.toString()).toEqual(expectedDate.toString());
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event: Event = {
      id: '1',
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
      title: '',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'none',
        interval: 1,
        endDate: '2025-07-02',
      },
      notificationTime: 0,
    };

    const expectedRange = {
      start: new Date('2025-07-01T14:30:00'),
      end: new Date('2025-07-01T15:30:00'),
    };

    const result = convertEventToDateRange(event);

    expect(result).toEqual(expectedRange);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const date = 'invalid-date';
    const time = '14:30';
    const result = parseDateTime(date, time);

    expect(result.toString()).toBe('Invalid Date');
    expect(isNaN(result.getTime())).toBe(true);
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const date = '2025-07-01';
    const time = 'invalid-time';
    const result = parseDateTime(date, time);

    expect(result.toString()).toBe('Invalid Date');
    expect(isNaN(result.getTime())).toBe(true);
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1: Event = {
      id: '1',
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
      title: '',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'none',
        interval: 1,
        endDate: '2025-07-02',
      },
      notificationTime: 0,
    };
    const event2: Event = {
      id: '2',
      date: '2025-07-01',
      startTime: '15:00',
      endTime: '16:00',
      title: '',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'none',
        interval: 1,
        endDate: '2025-07-02',
      },
      notificationTime: 0,
    };

    const result = isOverlapping(event1, event2);

    expect(result).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1: Event = {
      id: '1',
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
      title: '',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'none',
        interval: 1,
        endDate: '2025-07-02',
      },
      notificationTime: 0,
    };
    const event2: Event = {
      id: '2',
      date: '2025-07-01',
      startTime: '15:30',
      endTime: '16:00',
      title: '',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'none',
        interval: 1,
        endDate: '2025-07-02',
      },
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
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
      title: '',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'none',
        interval: 1,
        endDate: '2025-07-02',
      },
      notificationTime: 0,
    };
    const events: Event[] = [
      {
        id: '2',
        date: '2025-07-01',
        startTime: '15:00',
        endTime: '16:00',
        title: '',
        description: '',
        location: '',
        category: '',
        repeat: {
          type: 'none',
          interval: 1,
          endDate: '2025-07-02',
        },
        notificationTime: 0,
      },
      {
        id: '3',
        date: '2025-07-01',
        startTime: '16:00',
        endTime: '17:00',
        title: '',
        description: '',
        location: '',
        category: '',
        repeat: {
          type: 'none',
          interval: 1,
          endDate: '2025-07-02',
        },
        notificationTime: 0,
      },
    ];

    const result = findOverlappingEvents(newEvent, events);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const existingEvents: Event[] = [
      {
        id: '1',
        title: '미팅 1',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '11:00',
        description: '미팅 1',
        location: '',
        category: '',
        repeat: {
          type: 'none',
          interval: 1,
          endDate: '2025-07-02',
        },
        notificationTime: 0,
      },
      {
        id: '2',
        title: '미팅 2',
        date: '2025-07-01',
        startTime: '14:00',
        endTime: '16:00',
        description: '미팅 2',
        location: '',
        category: '',
        repeat: {
          type: 'none',
          interval: 1,
          endDate: '2025-07-02',
        },
        notificationTime: 0,
      },
    ];

    const newEvent: Event = {
      id: '3',
      title: '새 미팅',
      date: '2025-07-01',
      startTime: '11:30',
      endTime: '13:30',
      description: '새 미팅',
      location: '',
      category: '',
      repeat: {
        type: 'none',
        interval: 1,
        endDate: '2025-07-02',
      },
      notificationTime: 0,
    };

    const result = findOverlappingEvents(newEvent, existingEvents);

    expect(result).toEqual([]);
    expect(result.length).toBe(0);
  });
});
