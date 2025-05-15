import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

const MOCK_EVENT: Event = {
  id: '1',
  title: '1번 이벤트',
  date: '2025-05-01',
  startTime: '10:00',
  endTime: '11:00',
  description: '1번 이벤트 설명',
  location: '1번 이벤트 장소',
  category: '1번 이벤트 카테고리',
  repeat: {
    type: 'none',
    interval: 0,
  },
  notificationTime: 0,
};

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const date = parseDateTime('2025-07-01', '14:30');

    expect(date).toEqual(new Date('2025-07-01T14:30:00'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const date = parseDateTime('2025-07-01', '14:30');

    expect(date).toEqual(new Date('2025-07-01T14:30:00'));
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const date = parseDateTime('2025-07-01', '14:30');

    expect(date).toEqual(new Date('2025-07-01T14:30:00'));
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const date = parseDateTime('', '14:30');

    expect(date).toEqual(new Date('Invalid Date'));
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event = convertEventToDateRange(MOCK_EVENT);

    expect(event).toEqual({
      start: new Date('2025-05-01T10:00:00'),
      end: new Date('2025-05-01T11:00:00'),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const INVALID_EVENT = {
      ...MOCK_EVENT,
      date: 'Invalid Date',
    };

    const event = convertEventToDateRange(INVALID_EVENT);

    expect(event).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const INVALID_EVENT = {
      ...MOCK_EVENT,
      startTime: 'Invalid Time',
      endTime: 'Invalid Time',
    };

    const event = convertEventToDateRange(INVALID_EVENT);

    expect(event).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event = isOverlapping(MOCK_EVENT, MOCK_EVENT);

    expect(event).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const ADDITIONAL_EVENT = {
      ...MOCK_EVENT,
      date: '2025-05-02',
    };

    const event = isOverlapping(MOCK_EVENT, ADDITIONAL_EVENT);

    expect(event).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const ADDITIONAL_EVENTS = [
      {
        ...MOCK_EVENT,
        id: '2',
      },
    ];

    const events = findOverlappingEvents(MOCK_EVENT, ADDITIONAL_EVENTS);

    expect(events).toEqual([ADDITIONAL_EVENTS[0]]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const ADDITIONAL_EVENTS = [
      {
        ...MOCK_EVENT,
        id: '2',
        date: '2025-05-02',
      },
    ];

    const events = findOverlappingEvents(MOCK_EVENT, ADDITIONAL_EVENTS);

    expect(events).toEqual([]);
  });
});
