import { Event, EventForm } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const result = parseDateTime('2025-07-01', '14:30');
    expect(result.toISOString()).toBe(new Date('2025-07-01T14:30').toISOString());
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('invalid-date', '12:00');
    expect(result.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-07-01', '99:99');
    expect(result.toString()).toBe('Invalid Date');
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('', '12:00');
    expect(result.toString()).toBe('Invalid Date');
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event: EventForm = {
      title: '테스트 이벤트',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '설명',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };
    const { start, end } = convertEventToDateRange(event);
    expect(start.toISOString()).toBe(new Date('2025-07-01T09:00').toISOString());
    expect(end.toISOString()).toBe(new Date('2025-07-01T10:00').toISOString());
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: EventForm = {
      title: '테스트 이벤트',
      date: 'abc',
      startTime: '09:00',
      endTime: '10:00',
      description: '설명',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };
    const { start, end } = convertEventToDateRange(event);
    expect(start.toString()).toBe('Invalid Date');
    expect(end.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: EventForm = {
      title: '테스트 이벤트',
      date: '2025-07-01',
      startTime: '25:00',
      endTime: '26:00',
      description: '설명',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };
    const { start, end } = convertEventToDateRange(event);
    expect(start.toString()).toBe('Invalid Date');
    expect(end.toString()).toBe('Invalid Date');
  });
});

describe('isOverlapping', () => {
  const baseEvent: EventForm = {
    title: '기본 이벤트',
    date: '2025-07-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  };

  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const overlapEvent: EventForm = {
      ...baseEvent,
      startTime: '10:30',
      endTime: '11:30',
    };
    expect(isOverlapping(baseEvent, overlapEvent)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const nonOverlapEvent: EventForm = {
      ...baseEvent,
      date: '2025-07-01',
      startTime: '11:00',
      endTime: '12:00',
    };
    expect(isOverlapping(baseEvent, nonOverlapEvent)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '회의 A',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '회의 B',
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
      id: '3',
      title: '회의 C',
      date: '2025-07-01',
      startTime: '11:00',
      endTime: '12:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
  ];

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent: Event = {
      id: 'NEW',
      title: '새 이벤트',
      date: '2025-07-01',
      startTime: '10:30',
      endTime: '11:30',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };
    const overlaps = findOverlappingEvents(newEvent, events);
    const ids = overlaps.map((e) => e.id);
    expect(ids).toEqual(['2', '3']);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: Event = {
      id: 'NEW',
      title: '비어 있는 시간',
      date: '2025-07-01',
      startTime: '12:30',
      endTime: '13:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };
    const overlaps = findOverlappingEvents(newEvent, events);
    expect(overlaps).toEqual([]);
  });
});
