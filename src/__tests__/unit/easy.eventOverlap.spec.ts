import { Event } from '@/types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '@/utils/eventOverlap';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const dateTime = parseDateTime('2025-07-01', '14:30');
    expect(dateTime).toEqual(new Date('2025-07-01T14:30:00'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const dateTime = parseDateTime('2025-07-011', '14:30');
    expect(dateTime.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const dateTime = parseDateTime('2025-07-01', '114:30');
    expect(dateTime.toString()).toBe('Invalid Date');
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const dateTime = parseDateTime('', '14:30');
    expect(dateTime.toString()).toBe('Invalid Date');
  });
});

describe('convertEventToDateRange', () => {
  const common: Event = {
    id: '1',
    title: '111',
    date: '2025-05-11',
    startTime: '10:00',
    endTime: '11:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  } as const;

  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event = convertEventToDateRange(common);
    expect(event.start.toISOString()).toEqual(new Date('2025-05-11T10:00:00').toISOString());
    expect(event.end.toISOString()).toEqual(new Date('2025-05-11T11:00:00').toISOString());
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = convertEventToDateRange({ ...common, date: '2025-05-011' });
    expect(event.start.toString()).toBe('Invalid Date');
    expect(event.end.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = convertEventToDateRange({ ...common, startTime: '2025-05-01', endTime: '' });
    expect(event.start.toString()).toBe('Invalid Date');
    expect(event.end.toString()).toBe('Invalid Date');
  });
});

describe('isOverlapping', () => {
  const event: Event = {
    id: '1',
    title: '111',
    date: '2025-05-11',
    startTime: '10:00',
    endTime: '11:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  } as const;

  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const other = { ...event, id: '2', startTime: '10:30', endTime: '11:30' };
    expect(isOverlapping(event, other)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const other = { ...event, id: '2', startTime: '11:00', endTime: '12:30' };
    expect(isOverlapping(event, other)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  const common: Event = {
    id: '1',
    title: '111',
    date: '2025-05-11',
    startTime: '10:00',
    endTime: '11:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  } as const;
  const events: Event[] = [
    { ...common },
    { ...common, id: '2', startTime: '11:00', endTime: '12:00' },
    { ...common, id: '3', startTime: '13:00', endTime: '14:00' },
  ];

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent: Event = { ...common, id: '4', startTime: '10:00', endTime: '12:00' };
    const overlappingEvents = findOverlappingEvents(newEvent, events);
    expect(overlappingEvents).toEqual([events[0], events[1]]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: Event = { ...common, id: '4', startTime: '12:00', endTime: '13:00' };
    const overlappingEvents = findOverlappingEvents(newEvent, events);
    expect(overlappingEvents.length).toBe(0);
  });
});
