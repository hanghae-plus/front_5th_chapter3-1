import { Event, EventForm } from '../../types';
import {
  parseDateTime,
  convertEventToDateRange,
  isOverlapping,
  findOverlappingEvents,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const date = '2025-07-01';
    const time = '14:30';
    const result = parseDateTime(date, time);
    expect(result).toBeInstanceOf(Date);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(6); // 0-indexed (7월 = 6)
    expect(result.getDate()).toBe(1);
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-13-01', '14:30');
    expect(result.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-07-01', '25:61');
    expect(result.toString()).toBe('Invalid Date');
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('', '14:30');
    expect(result.toString()).toBe('Invalid Date');
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event: EventForm = {
      title: '회의',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };
    const range = convertEventToDateRange(event);
    expect(range.start).toEqual(new Date('2025-07-01T10:00'));
    expect(range.end).toEqual(new Date('2025-07-01T11:00'));
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: EventForm = {
      title: '잘못된 날짜',
      date: '2025-13-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };
    const range = convertEventToDateRange(event);
    expect(range.start.toString()).toBe('Invalid Date');
    expect(range.end.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: EventForm = {
      title: '잘못된 시간',
      date: '2025-07-01',
      startTime: '25:00',
      endTime: '26:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };
    const range = convertEventToDateRange(event);
    expect(range.start.toString()).toBe('Invalid Date');
    expect(range.end.toString()).toBe('Invalid Date');
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1: EventForm = {
      title: '이벤트1',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };
    const event2: EventForm = {
      title: '이벤트2',
      date: '2025-07-01',
      startTime: '10:30',
      endTime: '11:30',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };
    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1: EventForm = {
      title: '이벤트1',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };
    const event2: EventForm = {
      title: '이벤트2',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };
    expect(isOverlapping(event1, event2)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  const events: Event[] = [
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
      title: '점심',
      date: '2025-07-01',
      startTime: '12:00',
      endTime: '13:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '미팅',
      date: '2025-07-01',
      startTime: '10:30',
      endTime: '11:30',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
  ];

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent: Event = {
      id: 'new',
      title: '겹치는 이벤트',
      date: '2025-07-01',
      startTime: '10:15',
      endTime: '11:15',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };
    const overlapping = findOverlappingEvents(newEvent, events);
    expect(overlapping.map((e) => e.id).sort()).toEqual(['1', '3']);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: Event = {
      id: 'new',
      title: '겹치지 않는 이벤트',
      date: '2025-07-01',
      startTime: '13:30',
      endTime: '14:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };
    const overlapping = findOverlappingEvents(newEvent, events);
    expect(overlapping).toEqual([]);
  });
});
