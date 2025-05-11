import { Event, EventForm } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';
import { mockTestDataList } from '../data/mockTestData';

const overlappedEvent = {
  id: '10',
  date: '2025-05-01',
  title: 'new Event',
  startTime: '09:00',
  endTime: '15:00',
  description: 'new 미팅',
  location: '회의실 B',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 10,
} as Event;

const notOverlappedEvent = {
  id: '10',
  date: '2025-05-01',
  title: 'new Event',
  startTime: '15:00',
  endTime: '16:00',
  description: 'new 미팅',
  location: '회의실 B',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 10,
} as Event;

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const result = parseDateTime('2025-07-01', '14:30');
    expect(result).toEqual(new Date('2025-07-01T14:30:00'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-13-01', '12:00'); // 13월은 없음
    expect(result).toEqual(new Date('Invalid Date'));
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-07-01', '25:00'); // 25시는 없음
    expect(result).toEqual(new Date('Invalid Date'));
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('', '12:00');
    expect(result).toEqual(new Date('Invalid Date'));
  });
});

describe('convertEventToDateRange', () => {
  const validEvent: EventForm = {
    date: '2025-07-01',
    startTime: '09:00',
    endTime: '10:00',
  } as EventForm;
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const result = convertEventToDateRange(validEvent);
    expect(result).toEqual({
      start: new Date('2025-07-01T09:00:00'),
      end: new Date('2025-07-01T10:00:00'),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const invalidEvent = {
      ...validEvent,
      date: '2025-13-01',
    } as EventForm;
    const result = convertEventToDateRange(invalidEvent);
    expect(result).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const invalidEvent = {
      ...validEvent,
      startTime: '25:00',
    } as EventForm;
    const result = convertEventToDateRange(invalidEvent);
    expect(result).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('2025-07-01T10:00:00'),
    });
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const events = mockTestDataList;
    const result = isOverlapping(overlappedEvent, events[0]);
    expect(result).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const events = mockTestDataList;
    const result = isOverlapping(notOverlappedEvent, events[0]);
    expect(result).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const events = mockTestDataList;

    const overlappingEvents = findOverlappingEvents(overlappedEvent, events);

    expect(overlappingEvents.map((e) => e.id)).toEqual(['1', '3']);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const events = mockTestDataList;

    const overlappingEvents = findOverlappingEvents(notOverlappedEvent, events);

    expect(overlappingEvents.map((e) => e.id)).toEqual([]);
  });
});
