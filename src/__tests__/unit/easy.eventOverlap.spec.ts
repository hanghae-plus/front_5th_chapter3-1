import { Event } from '../../types';
import {
  parseDateTime,
  convertEventToDateRange,
  isOverlapping,
  findOverlappingEvents,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const result = parseDateTime('2025-07-01', '14:30');

    expect(result).toEqual(new Date('2025-07-01T14:30'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('22221123', '10:00');

    expect(result.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-07-01', 'xx:xx');

    expect(result.toString()).toBe('Invalid Date');
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('', '12:00');

    expect(result.toString()).toBe('Invalid Date');
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event: Event = {
      id: '1',
      title: '기존 회의',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const range = convertEventToDateRange(event);

    expect(range.start).toEqual(new Date('2025-07-01T09:00'));
    expect(range.end).toEqual(new Date('2025-07-01T10:00'));
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '2',
      title: '잘못된 날짜',
      date: 'abc',
      startTime: '09:00',
      endTime: '10:00',
      description: '잘못된 날짜 형식',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };

    const range = convertEventToDateRange(event);

    expect(range.start.toString()).toBe('Invalid Date');
    expect(range.end.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '3',
      title: '잘못된 시간',
      date: '2025-07-01',
      startTime: 'ss:xx',
      endTime: 'dd:xx',
      description: '잘못된 날짜 형식',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };

    const range = convertEventToDateRange(event);

    expect(range.start.toString()).toBe('Invalid Date');
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1: Event = {
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      id: '1',
      title: '',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const event2: Event = {
      date: '2025-07-01',
      startTime: '09:30',
      endTime: '10:30',
      id: '2',
      title: '',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };

    const result = isOverlapping(event1, event2);

    expect(result).toBeTruthy();
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1: Event = {
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      id: '1',
      title: '',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const event2: Event = {
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      id: '2',
      title: '',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };

    const result = isOverlapping(event1, event2);

    expect(result).toBeFalsy();
  });
});

describe('findOverlappingEvents', () => {
  const baseEvent: Event = {
    id: '1',
    date: '2025-07-01',
    startTime: '09:00',
    endTime: '10:00',
    title: '',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  };

  const events: Event[] = [
    baseEvent,
    { ...baseEvent, id: '2', startTime: '09:30', endTime: '10:30' },
    { ...baseEvent, id: '3', startTime: '10:00', endTime: '11:00' },
  ];

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const overlapping = findOverlappingEvents(baseEvent, events);

    expect(overlapping.map((e) => e.id)).toEqual(['2']);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: Event = { ...baseEvent, id: '4', startTime: '12:00', endTime: '13:00' };

    const overlapping = findOverlappingEvents(newEvent, events);

    expect(overlapping).toHaveLength(0);
  });
});