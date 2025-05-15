import { Event, EventForm } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    // Given
    const date = '2025-07-01';
    const time = '14:30';

    // When
    const result = parseDateTime(date, time);

    // Then
    expect(result.toISOString()).toBe('2025-07-01T14:30:00.000Z');
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    // Given
    const date = 'invalid-date';
    const time = '14:30';

    // When
    const result = parseDateTime(date, time);

    // Then
    expect(isNaN(result.getTime())).toBe(true);
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    // Given
    const date = '2025-07-01';
    const time = 'invalid-time';

    // When
    const result = parseDateTime(date, time);

    // Then
    expect(isNaN(result.getTime())).toBe(true);
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    // Given
    const date = '';
    const time = '14:30';

    // When
    const result = parseDateTime(date, time);

    // Then
    expect(isNaN(result.getTime())).toBe(true);
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    // Given
    const event = {
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
    } as EventForm;

    // When
    const result = convertEventToDateRange(event);

    // Then
    expect(result.start.toISOString()).toBe('2025-07-01T10:00:00.000Z');
    expect(result.end.toISOString()).toBe('2025-07-01T11:00:00.000Z');
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    // Given
    const event = {
      date: 'invalid-date',
      startTime: '10:00',
      endTime: '11:00',
    } as EventForm;

    // When
    const result = convertEventToDateRange(event);

    // Then
    expect(isNaN(result.start.getTime())).toBe(true);
    expect(isNaN(result.end.getTime())).toBe(true);
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    // Given
    const event = {
      date: '2025-07-01',
      startTime: 'invalid-time',
      endTime: 'wrong',
    } as EventForm;

    // When
    const result = convertEventToDateRange(event);

    // Then
    expect(isNaN(result.start.getTime())).toBe(true);
    expect(isNaN(result.end.getTime())).toBe(true);
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    // Given
    const event1: EventForm = {
      title: '',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    };

    const event2: EventForm = {
      title: '',
      date: '2025-07-01',
      startTime: '10:30',
      endTime: '11:30',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    };

    // When
    const result = isOverlapping(event1, event2);

    // Then
    expect(result).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    // Given
    const event1: EventForm = {
      title: '',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    };

    const event2: EventForm = {
      title: '',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    };

    // When
    const result = isOverlapping(event1, event2);

    // Then
    expect(result).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  const existingEvents: Event[] = [
    {
      id: '1',
      title: '회의',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '점심식사',
      date: '2025-07-01',
      startTime: '12:00',
      endTime: '13:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
  ];
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    // Given
    const newEvent: Event = {
      id: 'new',
      title: '겹치는 일정',
      date: '2025-07-01',
      startTime: '10:30',
      endTime: '11:30',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 5,
    };

    // When
    const result = findOverlappingEvents(newEvent, existingEvents);

    // Then
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    // Given
    const newEvent: Event = {
      id: 'new',
      title: '안 겹치는 일정',
      date: '2025-07-01',
      startTime: '13:00',
      endTime: '14:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 5,
    };

    // When
    const result = findOverlappingEvents(newEvent, existingEvents);

    // Then
    expect(result).toEqual([]);
  });
});
