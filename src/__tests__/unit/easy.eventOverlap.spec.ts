import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

const validEvent: Event = {
  id: '0',
  title: '테스트',
  date: '2025-07-01',
  startTime: '09:00',
  endTime: '10:00',
  description: '',
  location: '',
  category: '',
  repeat: { type: 'none', interval: 1 },
  notificationTime: 0,
};

describe('parseDateTime', () => {
  const dateString = '2025-07-01';
  const timeString = '14:30';

  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const result = parseDateTime(dateString, timeString);
    expect(result.toISOString()).toBe(new Date('2025-07-01T14:30').toISOString());
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('날짜 형식이 아님', timeString);
    expect(result.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime(dateString, '시간 형식이 아님');
    expect(result.toString()).toBe('Invalid Date');
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('', timeString);
    expect(result.toString()).toBe('Invalid Date');
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const result = convertEventToDateRange(validEvent);
    expect(result.start.toISOString()).toBe(new Date('2025-07-01T09:00').toISOString());
    expect(result.end.toISOString()).toBe(new Date('2025-07-01T10:00').toISOString());
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = {
      ...validEvent,
      date: '',
    };

    const result = convertEventToDateRange(event);
    expect(result.start.toString()).toBe('Invalid Date');
    expect(result.end.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = {
      ...validEvent,
      startTime: '',
      endTime: '',
    };

    const result = convertEventToDateRange(event);
    expect(result.start.toString()).toBe('Invalid Date');
    expect(result.end.toString()).toBe('Invalid Date');
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1 = {
      ...validEvent,
      title: '이벤트 1',
      startTime: '10:00',
      endTime: '11:00',
    };
    const event2 = {
      ...validEvent,
      title: '이벤트 2',
      startTime: '10:00',
      endTime: '11:00',
    };

    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1 = {
      ...validEvent,
      title: '이벤트 1',
      startTime: '09:00',
      endTime: '10:00',
    };
    const event2 = {
      ...validEvent,
      title: '이벤트 2',
      startTime: '10:00',
      endTime: '11:00',
    };

    expect(isOverlapping(event1, event2)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  const baseEvents: Event[] = [
    {
      id: '1',
      title: '회의',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    },
    {
      id: '2',
      title: '워크숍',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    },
    {
      id: '3',
      title: '점심 약속',
      date: '2025-07-01',
      startTime: '12:00',
      endTime: '13:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    },
  ];

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent: Event = {
      id: 'new',
      title: '중간 회의',
      date: '2025-07-01',
      startTime: '09:30',
      endTime: '10:30',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    };

    const result = findOverlappingEvents(newEvent, baseEvents);
    expect(result.map((e) => e.id)).toEqual(['1', '2']);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: Event = {
      id: 'new',
      title: '저녁 식사',
      date: '2025-07-01',
      startTime: '18:00',
      endTime: '19:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    };

    const result = findOverlappingEvents(newEvent, baseEvents);
    expect(result).toEqual([]);
  });
});
