import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

// 총 11개

describe('parseDateTime', () => {
  it('2025-05-12 14:30을 정확한 Date 객체로 변환한다', () => {
    const date = parseDateTime('2025-05-12', '21:30');
    expect(isNaN(date.getTime())).toBe(false);
    expect(date.getFullYear()).toBe(2025);
    expect(date.getMonth()).toBe(4);
    expect(date.getDate()).toBe(12);
    expect(date.getHours()).toBe(21);
    expect(date.getMinutes()).toBe(30);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const date = parseDateTime('invalid-date-format', '21:30');
    expect(isNaN(date.getTime())).toBe(true);
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const date = parseDateTime('2025-05-12', 'invalid-time-format');
    expect(isNaN(date.getTime())).toBe(true);
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const date = parseDateTime('', '21:30');
    expect(isNaN(date.getTime())).toBe(true);
    const date2 = parseDateTime('2025-05-12', '');
    expect(isNaN(date2.getTime())).toBe(true);
  });
});

describe('convertEventToDateRange', () => {
  const event: Event = {
    id: '1',
    title: 'Test Event',
    date: '2025-05-12',
    startTime: '10:00',
    endTime: '11:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 0,
  };
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const range = convertEventToDateRange(event);
    expect(isNaN(range.start.getTime())).toBe(false);
    expect(isNaN(range.end.getTime())).toBe(false);
    expect(range.start.getHours()).toBe(10);
    expect(range.end.getHours()).toBe(11);
    expect(range.start < range.end).toBe(true);
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const invalidDateEvent = { ...event, date: 'invalid-date' };
    const range = convertEventToDateRange(invalidDateEvent);
    expect(isNaN(range.start.getTime())).toBe(true);
    expect(isNaN(range.end.getTime())).toBe(true);
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const invalidTimeEvent = { ...event, startTime: 'invalid-time' };
    const range = convertEventToDateRange(invalidTimeEvent);
    expect(isNaN(range.start.getTime())).toBe(true);
    expect(isNaN(range.end.getTime())).toBe(false);

    const invalidEndTimeEvent = { ...event, endTime: 'invalid-time' };
    const range2 = convertEventToDateRange(invalidEndTimeEvent);
    expect(isNaN(range2.start.getTime())).toBe(false);
    expect(isNaN(range2.end.getTime())).toBe(true);
  });
});

describe('isOverlapping', () => {
  const event1: Event = {
    id: '1',
    title: '지금 뭐 먹으면 살찌겠지',
    date: '2025-05-12',
    startTime: '10:00',
    endTime: '15:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 0,
  };

  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event2: Event = {
      ...event1,
      title: '먹을까말까먹을까말까',
      startTime: '12:00',
      endTime: '16:00',
    };
    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event2: Event = {
      ...event1,
      title: '먹으면 안된다 살찐다',
      startTime: '21:00',
      endTime: '22:00',
    };
    expect(isOverlapping(event1, event2)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '제육볶음',
      date: '2025-05-12',
      startTime: '09:00',
      endTime: '10:30',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    },
    {
      id: '2',
      title: '감자탕',
      date: '2025-05-12',
      startTime: '10:00',
      endTime: '13:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    },
    {
      id: '3',
      title: '김치볶음밥',
      date: '2025-05-12',
      startTime: '11:30',
      endTime: '12:30',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    },
    {
      id: '4',
      title: '라멘',
      date: '2025-05-12',
      startTime: '15:00',
      endTime: '18:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    },
    {
      id: '5',
      title: '치즈퐁듀',
      date: '2025-05-12',
      startTime: '20:00',
      endTime: '22:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    },
  ];
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent: Event = {
      id: '6',
      title: '햄버거',
      date: '2025-05-12',
      startTime: '10:00',
      endTime: '12:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    };
    const filteredEvents = findOverlappingEvents(newEvent, events);
    expect(filteredEvents).toHaveLength(3);
    expect(filteredEvents.map((e) => e.id)).toEqual(['1', '2', '3']);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: Event = {
      id: '6',
      title: '햄버거',
      date: '2025-05-12',
      startTime: '18:00',
      endTime: '19:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    };
    const filteredEvents = findOverlappingEvents(newEvent, events);
    expect(filteredEvents).toHaveLength(0);
    expect(filteredEvents.map((e) => e.id)).toEqual([]);
  });
});
