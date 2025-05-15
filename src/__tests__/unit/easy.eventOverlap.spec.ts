import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../based/utils/eventOverlap';
import { Event } from '../../types';

const MOCK_EVENT: Event = {
  id: '1',
  date: '2025-07-01',
  startTime: '14:30',
  endTime: '15:30',
  title: '이벤트1',
  description: '이벤트1 설명',
  location: '이벤트1 장소',
  category: '이벤트1 카테고리',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 0,
};

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const result = parseDateTime('2025-07-01', '14:30');
    expect(result).toEqual(new Date('2025-07-01T14:30:00'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-07-01', '14:30');
    expect(result).toEqual(new Date('2025-07-01T14:30:00'));
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-07-01', '14:30');
    expect(result).toEqual(new Date('2025-07-01T14:30:00'));
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('', '14:30');
    expect(result).toEqual(new Date('Invalid Date'));
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const result = convertEventToDateRange(MOCK_EVENT);

    expect(result).toEqual({
      start: new Date('2025-07-01T14:30:00'),
      end: new Date('2025-07-01T15:30:00'),
    });
  });

  it('date가 "Invalid Date"인 이벤트를 변환하면 start/end가 Invalid Date가 된다', () => {
    const INVALID_EVENT = {
      ...MOCK_EVENT,
      date: 'Invalid Date',
    };

    const result = convertEventToDateRange(INVALID_EVENT);

    expect(result).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });

  it('startTime, endTime이 "Invalid Time"인 이벤트를 변환하면 start/end가 Invalid Date가 된다', () => {
    const INVALID_EVENT = {
      ...MOCK_EVENT,
      startTime: '',
      endTime: '',
    };

    const result = convertEventToDateRange(INVALID_EVENT);

    expect(result).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const result = isOverlapping(MOCK_EVENT, MOCK_EVENT);

    expect(result).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const MOCK_EVENT_2: Event = {
      ...MOCK_EVENT,
      date: '2025-07-01',
      startTime: '15:30',
      endTime: '16:30',
    };

    const result = isOverlapping(MOCK_EVENT, MOCK_EVENT_2);

    expect(result).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const MOCK_EVENTS: Event[] = [
      {
        ...MOCK_EVENT,
        id: '2',
      },
    ];

    const result = findOverlappingEvents(MOCK_EVENT, MOCK_EVENTS);

    expect(result).toEqual([MOCK_EVENTS[0]]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const MOCK_EVENTS: Event[] = [
      {
        ...MOCK_EVENT,
        id: '2',
        date: '2025-07-01',
        startTime: '15:30',
        endTime: '16:30',
      },
    ];

    const result = findOverlappingEvents(MOCK_EVENT, MOCK_EVENTS);

    expect(result).toEqual([]);
  });
});
