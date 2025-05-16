import { Event, EventForm } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

const baseFormEvent: Omit<EventForm, 'date' | 'startTime' | 'endTime'> = {
  title: '',
  description: '',
  location: '',
  category: '',
  repeat: { type: 'none', interval: 1 },
  notificationTime: 0,
};

const baseEvent: Omit<Event, 'id' | 'date' | 'startTime' | 'endTime'> = {
  title: '',
  description: '',
  location: '',
  category: '',
  repeat: { type: 'none', interval: 1 },
  notificationTime: 0,
};

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const result = parseDateTime('2025-07-01', '14:30');
    expect(result.toISOString()).toBe(new Date('2025-07-01T14:30').toISOString());
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('invalid-date', '14:30');
    expect(isNaN(result.getTime())).toBe(true);
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-07-01', 'invalid-time');
    expect(isNaN(result.getTime())).toBe(true);
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('', '10:00');
    expect(isNaN(result.getTime())).toBe(true);
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event: EventForm = {
      ...baseFormEvent,
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
    };
    const { start, end } = convertEventToDateRange(event);
    expect(start.toISOString()).toBe(new Date('2025-07-01T09:00').toISOString());
    expect(end.toISOString()).toBe(new Date('2025-07-01T10:00').toISOString());
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: EventForm = {
      ...baseFormEvent,
      date: 'invalid',
      startTime: '09:00',
      endTime: '10:00',
    };
    const { start, end } = convertEventToDateRange(event);
    expect(isNaN(start.getTime())).toBe(true);
    expect(isNaN(end.getTime())).toBe(true);
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: EventForm = {
      ...baseFormEvent,
      date: '2025-07-01',
      startTime: '99:00',
      endTime: 'abc',
    };
    const { start, end } = convertEventToDateRange(event);
    expect(isNaN(start.getTime())).toBe(true);
    expect(isNaN(end.getTime())).toBe(true);
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const e1: EventForm = {
      ...baseFormEvent,
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
    };
    const e2: EventForm = {
      ...baseFormEvent,
      date: '2025-07-01',
      startTime: '09:30',
      endTime: '10:30',
    };
    expect(isOverlapping(e1, e2)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const e1: EventForm = {
      ...baseFormEvent,
      date: '2025-07-01',
      startTime: '08:00',
      endTime: '09:00',
    };
    const e2: EventForm = {
      ...baseFormEvent,
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
    };
    expect(isOverlapping(e1, e2)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  const events: Event[] = [
    {
      ...baseEvent,
      id: '1',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
    },
    {
      ...baseEvent,
      id: '2',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
    },
    {
      ...baseEvent,
      id: '3',
      date: '2025-07-01',
      startTime: '09:30',
      endTime: '10:30',
    },
  ];

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent: EventForm = {
      ...baseFormEvent,
      date: '2025-07-01',
      startTime: '09:15',
      endTime: '10:15',
    };
    const overlapping = findOverlappingEvents(newEvent, events);
    const ids = overlapping.map((e) => e.id);
    expect(ids).toEqual(expect.arrayContaining(['1', '2', '3']));
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: EventForm = {
      ...baseFormEvent,
      date: '2025-07-01',
      startTime: '11:00',
      endTime: '12:00',
    };
    const overlapping = findOverlappingEvents(newEvent, events);
    expect(overlapping).toEqual([]);
  });
});
