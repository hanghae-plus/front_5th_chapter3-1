import { overlapTestEvents } from '../../__mocks__/fixtures';
import { Event, EventForm } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const date = parseDateTime('2025-07-01', '14:30');
    expect(date).toEqual(new Date('2025-07-01T14:30'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const date = parseDateTime('2025-07-010', '14:30');
    expect(date).toEqual(new Date('Invalid Date'));
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const date = parseDateTime('2025-07-01', '14:30:300');
    expect(date).toEqual(new Date('Invalid Date'));
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const date = parseDateTime('', '14:30');
    expect(date).toEqual(new Date('Invalid Date'));
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event: Event = {
      id: '1',
      title: 'test',
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
      description: 'test',
      location: 'test',
      category: 'test',
      repeat: {
        type: 'none',
        interval: 1,
      },
      notificationTime: 10,
    };
    const dateRange = convertEventToDateRange(event);
    expect(dateRange).toEqual({
      start: new Date('2025-07-01T14:30'),
      end: new Date('2025-07-01T15:30'),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '1',
      title: 'test',
      date: '2025-07-010',
      startTime: '14:30',
      endTime: '15:30',
      description: 'test',
      location: 'test',
      category: 'test',
      repeat: {
        type: 'none',
        interval: 1,
      },
      notificationTime: 10,
    };
    const dateRange = convertEventToDateRange(event);
    expect(dateRange).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '1',
      title: 'test',
      date: '2025-07-01',
      startTime: '14:300',
      endTime: '15:300',
      description: 'test',
      location: 'test',
      category: 'test',
      repeat: {
        type: 'none',
        interval: 1,
      },
      notificationTime: 10,
    };
    const dateRange = convertEventToDateRange(event);
    expect(dateRange).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1: Event = {
      id: '1',
      title: 'test',
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
      description: 'test',
      location: 'test',
      category: 'test',
      repeat: {
        type: 'none',
        interval: 1,
      },
      notificationTime: 10,
    };
    const event2: Event = {
      id: '2',
      title: 'test',
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
      description: 'test',
      location: 'test',
      category: 'test',
      repeat: {
        type: 'none',
        interval: 1,
      },
      notificationTime: 10,
    };
    const overlapping = isOverlapping(event1, event2);
    expect(overlapping).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1: Event = {
      id: '1',
      title: 'test',
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:300',
      description: 'test',
      location: 'test',
      category: 'test',
      repeat: {
        type: 'none',
        interval: 1,
      },
      notificationTime: 10,
    };
    const event2: Event = {
      id: '2',
      title: 'test',
      date: '2025-07-01',
      startTime: '16:30',
      endTime: '17:30',
      description: 'test',
      location: 'test',
      category: 'test',
      repeat: {
        type: 'none',
        interval: 1,
      },
      notificationTime: 10,
    };
    const overlapping = isOverlapping(event1, event2);
    expect(overlapping).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const overlappedEvent: EventForm = {
      title: '중복 이벤트',
      date: '2025-05-20',
      startTime: '10:00',
      endTime: '13:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    };

    const result = findOverlappingEvents(overlappedEvent, overlapTestEvents);
    expect(result).toEqual(overlapTestEvents);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const notOverlappedEvent: EventForm = {
      title: '중복 이벤트',
      date: '2025-05-20',
      startTime: '08:00',
      endTime: '09:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    };

    const result = findOverlappingEvents(notOverlappedEvent, overlapTestEvents);
    expect(result).toEqual([]);
  });
});
