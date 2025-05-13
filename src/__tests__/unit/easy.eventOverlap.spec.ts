import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const result = parseDateTime('2025-07-01', '14:30');
    expect(result).toEqual(new Date('2025-07-01T14:30:00'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-7-1', '14:30');
    expect(result).toEqual(new Date('Invalid Date'));
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-07-01', '4:30');
    expect(result).toEqual(new Date('Invalid Date'));
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('', '14:30');
    expect(result).toEqual(new Date('Invalid Date'));
  });
});

describe('convertEventToDateRange', () => {
  const event = {
    date: '2025-07-01',
    startTime: '14:30',
    endTime: '15:30',
  };
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const result = convertEventToDateRange(event);
    expect(result).toEqual({
      start: new Date('2025-07-01T14:30:00'),
      end: new Date('2025-07-01T15:30:00'),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const result = convertEventToDateRange({
      ...event,
      date: '2025-7-1',
    });
    expect(result).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });
  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const result = convertEventToDateRange({
      ...event,
      startTime: '4:80',
    });

    expect(result).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('2025-07-01T15:30:00.000Z'),
    });
  });
});

describe('isOverlapping', () => {
  const event1 = {
    date: '2025-07-01',
    startTime: '14:30',
    endTime: '15:30',
  };
  const event2 = {
    date: '2025-07-01',
    startTime: '15:00',
    endTime: '16:00',
  };
  const event3 = {
    date: '2025-07-01',
    startTime: '15:30',
    endTime: '16:30',
  };
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const result = isOverlapping(event1, event2);
    expect(result).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const result = isOverlapping(event1, event3);
    expect(result).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  const event1 = {
    id: '1',
    title: 'Event 1',
    date: '2025-07-01',
    startTime: '14:30',
    endTime: '15:30',
    description: '',
    location: '',
    category: 'test',
    repeat: { type: 'none' },
    notificationTime: 10,
  };

  const event2 = {
    id: '2',
    title: 'Event 2',
    date: '2025-07-01',
    startTime: '15:00',
    endTime: '16:00',
    description: '',
    location: '',
    category: 'test',
    repeat: { type: 'none' },
    notificationTime: 10,
  };

  const event3 = {
    id: '3',
    title: 'Event 3',
    date: '2025-07-01',
    startTime: '15:30',
    endTime: '16:30',
    description: '',
    location: '',
    category: 'test',
    repeat: { type: 'none' },
    notificationTime: 10,
  };

  const newEvent = {
    title: 'New Event',
    date: '2025-07-01',
    startTime: '14:00',
    endTime: '15:00',
    description: '',
    location: '',
    category: 'test',
    repeat: { type: 'none' },
    notificationTime: 10,
  };

  const newEvent2 = {
    title: 'New Event',
    date: '2025-07-03',
    startTime: '14:00',
    endTime: '15:00',
    description: '',
    location: '',
    category: 'test',
    repeat: { type: 'none' },
    notificationTime: 10,
  };
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const events = [event1, event2, event3];

    const result = findOverlappingEvents(newEvent, events);

    expect(result).toEqual([event1]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const events = [event1, event2, event3];

    const result = findOverlappingEvents(newEvent2, events);

    expect(result).toEqual([]);
  });
});
