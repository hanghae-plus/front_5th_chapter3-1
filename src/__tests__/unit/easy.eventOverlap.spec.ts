import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const date = parseDateTime('2025-07-01', '14:30');
    expect(date).toEqual(new Date('2025-07-01T14:30:00'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const date = parseDateTime('2025-07-52', '14:30');
    expect(date).toEqual(new Date('Invalid Date'));
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const date = parseDateTime('2025-07-01', '25:60');
    expect(date).toEqual(new Date('Invalid Date'));
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const date = parseDateTime('', '14:30');
    expect(date).toEqual(new Date('Invalid Date'));
  });
});

describe('convertEventToDateRange', () => {
  const basicEvent: Event = {
    id: '1',
    title: '이벤트 1',
    date: '2025-07-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none' as const, interval: 0 },
    notificationTime: 0,
  };
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const result = convertEventToDateRange(basicEvent);
    expect(result.start).toEqual(new Date('2025-07-01T09:00:00'));
    expect(result.end).toEqual(new Date('2025-07-01T10:00:00'));
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const invalidDateEvent: Event = {
      ...basicEvent,
      date: '2025-07-52',
    };
    const result = convertEventToDateRange(invalidDateEvent);
    expect(result.start).toEqual(new Date('Invalid Date'));
    expect(result.end).toEqual(new Date('Invalid Date'));
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const invalidTimeEvent: Event = {
      ...basicEvent,
      startTime: '25:10',
      endTime: '26:10',
    };
    const result = convertEventToDateRange(invalidTimeEvent);
    expect(result.start).toEqual(new Date('Invalid Date'));
    expect(result.end).toEqual(new Date('Invalid Date'));
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1: Event = {
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 0,
    };
    const event2: Event = {
      id: '2',
      title: '이벤트 2',
      date: '2025-07-01',
      startTime: '09:30',
      endTime: '10:30',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 0,
    };
    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1: Event = {
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 0,
    };
    const event2: Event = {
      id: '2',
      title: '이벤트 2',
      date: '2025-07-01',
      startTime: '10:30',
      endTime: '11:30',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 0,
    };
    expect(isOverlapping(event1, event2)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  const events: Event[] = [
    {
      id: '2',
      title: '이벤트 2',
      date: '2025-07-01',
      startTime: '09:30',
      endTime: '10:30',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 0,
    },
    {
      id: '3',
      title: '이벤트 3',
      date: '2025-07-01',
      startTime: '10:30',
      endTime: '11:30',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 0,
    },
  ];
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent: Event = {
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 0,
    };
    const overlappingEvents = findOverlappingEvents(newEvent, events);
    expect(overlappingEvents.length).toBe(1);
    expect(overlappingEvents[0].id).toBe('2');
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: Event = {
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01',
      startTime: '15:00',
      endTime: '16:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 0,
    };
    const overlappingEvents = findOverlappingEvents(newEvent, events);
    expect(overlappingEvents.length).toBe(0);
  });
});
