import { Event, EventForm } from '../../types';
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
    expect(result).toBeInstanceOf(Date);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const date = '2025-13-01';
    const time = '14:30';
    const result = parseDateTime(date, time);
    expect(isNaN(result.getTime())).toBe(true);
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const date = '2025-07-01';
    const time = '25:30'; // 25시는 존재하지 않음
    const result = parseDateTime(date, time);
    expect(isNaN(result.getTime())).toBe(true);
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const date = '';
    const time = '14:30';
    const result = parseDateTime(date, time);
    expect(isNaN(result.getTime())).toBe(true);
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event: EventForm = {
      id: '1',
      title: '이벤트 1',
      description: '첫 번째 event 설명',
      location: '회의실 A',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      category: '업무',
      repeat: { type: 'none' },
      notificationTime: 30,
    };

    const dateRange = convertEventToDateRange(event);
    expect(dateRange.start).toBeInstanceOf(Date);

    expect(dateRange.end).toBeInstanceOf(Date);
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: EventForm = {
      id: '2',
      title: '이벤트 2',
      description: '두 번째 event 설명',
      location: '회의실 A',
      date: '2025-13-01',
      startTime: '10:00',
      endTime: '11:00',
      category: '업무',
      repeat: { type: 'none' },
      notificationTime: 30,
    };

    const dateRange = convertEventToDateRange(event);

    expect(dateRange.start).toBeInstanceOf(Date);
    expect(isNaN(dateRange.start.getTime())).toBe(true);

    expect(dateRange.end).toBeInstanceOf(Date);
    expect(isNaN(dateRange.end.getTime())).toBe(true);
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: EventForm = {
      id: '2',
      title: '이벤트 2',
      description: '두 번째 event 설명',
      location: '회의실 A',
      date: '2025-07-01',
      startTime: '25:00',
      endTime: '11:30',
      category: '업무',
      repeat: { type: 'none' },
      notificationTime: 30,
    };

    const dateRange = convertEventToDateRange(event);

    expect(dateRange.start).toBeInstanceOf(Date);
    expect(isNaN(dateRange.start.getTime())).toBe(true);

    expect(dateRange.end).toBeInstanceOf(Date);
    expect(isNaN(dateRange.end.getTime())).toBe(false);
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1: EventForm = {
      id: '1',
      title: '이벤트 1',
      description: '첫 번째 event 설명',
      location: '회의실 A',
      date: '2025-07-01',
      startTime: '11:00',
      endTime: '12:00',
      category: '업무',
      repeat: { type: 'none' },
      notificationTime: 30,
    };

    const event2: EventForm = {
      id: '2',
      title: '이벤트 2',
      description: '두 번째 event 설명',
      location: '회의실 A',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '14:00',
      category: '업무',
      repeat: { type: 'none' },
      notificationTime: 30,
    };
    expect(isOverlapping(event1, event2)).toBe(true);
    // 역순으로 호출해도 동일한 결과여야 함
    expect(isOverlapping(event2, event1)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1: EventForm = {
      id: '1',
      title: '이벤트 1',
      description: '첫 번째 event 설명',
      location: '회의실 A',
      date: '2025-07-01',
      startTime: '11:00',
      endTime: '12:00',
      category: '업무',
      repeat: { type: 'none' },
      notificationTime: 30,
    };

    const event2: EventForm = {
      id: '2',
      title: '이벤트 2',
      description: '두 번째 event 설명',
      location: '회의실 A',
      date: '2025-07-01',
      startTime: '12:30',
      endTime: '14:00',
      category: '업무',
      repeat: { type: 'none' },
      notificationTime: 30,
    };

    expect(isOverlapping(event1, event2)).toBe(false);
    expect(isOverlapping(event2, event1)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      description: '첫 번째 event 설명',
      location: '회의실 A',
      date: '2025-07-01',
      startTime: '11:00',
      endTime: '12:00',
      category: '업무',
      repeat: { type: 'none' },
      notificationTime: 30,
    },
    {
      id: '2',
      title: '이벤트 2',
      description: '두 번째 event 설명',
      location: '회의실 A',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '14:00',
      category: '업무',
      repeat: { type: 'none' },
      notificationTime: 30,
    },
  ];
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const addEvent = {
      id: '3',
      title: '이벤트 3',
      description: '세 번째 event 설명',
      location: '회의실 A',
      date: '2025-07-01',
      startTime: '11:00',
      endTime: '12:00',
      category: '업무',
      repeat: { type: 'none' },
      notificationTime: 30,
    };
    const overlappingEvents = findOverlappingEvents(addEvent, events);
    expect(overlappingEvents.length).toBe(2);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const addEvent = {
      id: '3',
      title: '이벤트 3',
      description: '세 번째 event 설명',
      location: '회의실 A',
      date: '2025-08-01',
      startTime: '11:00',
      endTime: '12:00',
      category: '업무',
      repeat: { type: 'none' },
      notificationTime: 30,
    };
    const overlappingEvents = findOverlappingEvents(addEvent, events);
    expect(overlappingEvents.length).toBe(0);
  });
});
