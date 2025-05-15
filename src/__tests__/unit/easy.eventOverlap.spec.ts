import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';
import { MOCK_EVENTS } from '../mock';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const result = parseDateTime('2025-07-01', '14:30');
    expect(result).toBeInstanceOf(Date);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-13-01', '14:30');
    expect(result).toBeInstanceOf(Date);
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-07-01', '14:60');
    expect(result).toBeInstanceOf(Date);
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('', '');
    expect(result).toBeInstanceOf(Date);
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const result = convertEventToDateRange(MOCK_EVENTS[0]);

    expect(result.start).toEqual(new Date('2025-05-01T09:01'));
    expect(result.end).toEqual(new Date('2025-05-01T10:00:00'));
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const invalidDateEvent = {
      ...MOCK_EVENTS[0],
      date: 'invalid-date',
    };

    const result = convertEventToDateRange(invalidDateEvent);

    expect(result.start.toString()).toBe('Invalid Date');
    expect(result.end.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const invalidTimeEvent = {
      ...MOCK_EVENTS[0],
      startTime: '25:00',
      endTime: '99:99',
    };

    const result = convertEventToDateRange(invalidTimeEvent);

    expect(result.start.toString()).toBe('Invalid Date');
    expect(result.end.toString()).toBe('Invalid Date');
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const overlappingEvent: Event = {
      ...MOCK_EVENTS[0],
      id: '2',
      startTime: '09:01',
      endTime: '10:00',
    };

    expect(isOverlapping(MOCK_EVENTS[0], overlappingEvent)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const nonOverlappingEvent: Event = {
      ...MOCK_EVENTS[0],
      id: '2',
      startTime: '12:00',
      endTime: '13:00',
    };

    expect(isOverlapping(MOCK_EVENTS[0], nonOverlappingEvent)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  const overlappingEvent: Event = {
    ...MOCK_EVENTS[0],
    id: '2',
    startTime: '09:01',
    endTime: '10:00',
  };

  const nonOverlappingEvent: Event = {
    ...MOCK_EVENTS[0],
    id: '2',
    startTime: '12:00',
    endTime: '13:00',
  };

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const result = findOverlappingEvents(MOCK_EVENTS[0], [overlappingEvent, nonOverlappingEvent]);
    expect(result).toEqual([overlappingEvent]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const result = findOverlappingEvents(MOCK_EVENTS[0], [nonOverlappingEvent]);
    expect(result).toEqual([]);
  });
});
