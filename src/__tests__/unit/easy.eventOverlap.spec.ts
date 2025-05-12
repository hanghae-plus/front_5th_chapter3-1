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
  const event: Event = {
    id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
    title: '팀 회의',
    date: '2025-05-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 1,
  };

  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const result = convertEventToDateRange(event);

    expect(result.start).toEqual(new Date('2025-05-01T10:00'));
    expect(result.end).toEqual(new Date('2025-05-01T11:00'));
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const invalidDateEvent = {
      ...event,
      date: 'invalid-date',
    };

    const result = convertEventToDateRange(invalidDateEvent);

    expect(result.start.toString()).toBe('Invalid Date');
    expect(result.end.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const invalidTimeEvent = {
      ...event,
      startTime: '25:00',
      endTime: '99:99',
    };

    const result = convertEventToDateRange(invalidTimeEvent);

    expect(result.start.toString()).toBe('Invalid Date');
    expect(result.end.toString()).toBe('Invalid Date');
  });
});

describe('isOverlapping', () => {
  const event: Event = {
    id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
    title: '팀 회의',
    date: '2025-05-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 1,
  };

  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const overlappingEvent: Event = {
      ...event,
      id: '2',
      startTime: '10:00',
      endTime: '11:00',
    };

    expect(isOverlapping(event, overlappingEvent)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const nonOverlappingEvent: Event = {
      ...event,
      id: '2',
      startTime: '12:00',
      endTime: '13:00',
    };

    expect(isOverlapping(event, nonOverlappingEvent)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  const event: Event = {
    id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
    title: '팀 회의',
    date: '2025-05-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 1,
  };

  const overlappingEvent: Event = {
    ...event,
    id: '2',
    startTime: '10:00',
    endTime: '11:00',
  };

  const nonOverlappingEvent: Event = {
    ...event,
    id: '2',
    startTime: '12:00',
    endTime: '13:00',
  };

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const result = findOverlappingEvents(event, [overlappingEvent, nonOverlappingEvent]);
    expect(result).toEqual([overlappingEvent]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const result = findOverlappingEvents(event, [nonOverlappingEvent]);
    expect(result).toEqual([]);
  });
});
