import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const check = parseDateTime('2025-07-01', '14:30');
    expect(check).toEqual(new Date('2025-07-01T14:30:00'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const check = parseDateTime('2025-13-01', '14:30');
    expect(check).toEqual(new Date('Invalid Date'));
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const check = parseDateTime('2025-07-01', '1430');
    expect(check).toEqual(new Date('Invalid Date'));
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const check = parseDateTime('', '14:30');
    expect(check).toEqual(new Date('Invalid Date'));
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event: Event = {
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
      description: '이벤트 1 설명',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const check = convertEventToDateRange(event);
    expect(check).toEqual({
      start: new Date('2025-07-01T14:30:00'),
      end: new Date('2025-07-01T15:30:00'),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '1',
      title: '이벤트 1',
      date: '2025-13-01',
      startTime: '14:30',
      endTime: '15:30',
      description: '이벤트 1 설명',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const check = convertEventToDateRange(event);
    expect(check).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01',
      startTime: '1430',
      endTime: '1530',
      description: '이벤트 1 설명',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const check = convertEventToDateRange(event);
    expect(check).toEqual({ start: new Date('Invalid Date'), end: new Date('Invalid Date') });
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1: Event = {
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
      description: '이벤트 1 설명',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const event2: Event = {
      id: '2',
      title: '이벤트 2',
      date: '2025-07-01',
      startTime: '15:00',
      endTime: '16:00',
      description: '이벤트 2 설명',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const check = isOverlapping(event1, event2);
    expect(check).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1: Event = {
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
      description: '이벤트 1 설명',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const event2: Event = {
      id: '2',
      title: '이벤트 2',
      date: '2025-07-01',
      startTime: '15:30',
      endTime: '16:30',
      description: '이벤트 2 설명',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const check = isOverlapping(event1, event2);
    expect(check).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '14:30',
        endTime: '15:30',
        description: '이벤트 1 설명',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ];
    const newEvent: Event = {
      id: '2',
      title: '이벤트 2',
      date: '2025-07-01',
      startTime: '15:00',
      endTime: '16:00',
      description: '이벤트 2 설명',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const check = findOverlappingEvents(newEvent, events);
    expect(check).toEqual([events[0]]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '14:30',
        endTime: '15:30',
        description: '이벤트 1 설명',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ];
    const newEvent: Event = {
      id: '2',
      title: '이벤트 2',
      date: '2025-07-01',
      startTime: '15:30',
      endTime: '16:30',
      description: '이벤트 2 설명',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const check = findOverlappingEvents(newEvent, events);
    expect(check).toEqual([]);
  });
});
