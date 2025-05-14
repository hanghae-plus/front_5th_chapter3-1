import eventsData from '../../__mocks__/response/events.json';
import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    expect(parseDateTime('2025-07-01', '14:30')).toEqual(new Date('2025-07-01T14:30:00'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    expect(parseDateTime('2025-13-01', '14:30')).toEqual(new Date('Invalid Date'));
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    expect(parseDateTime('2025-07-01', '25:30')).toEqual(new Date('Invalid Date'));
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    expect(parseDateTime('', '14:30')).toEqual(new Date('Invalid Date'));
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event = eventsData.events[0] as Event;

    expect(convertEventToDateRange(event)).toEqual({
      start: new Date('2025-10-15T09:00:00'),
      end: new Date('2025-10-15T10:00:00'),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = {
      ...eventsData.events[0],
      date: '2025-13-01',
    } as Event;

    expect(convertEventToDateRange(event)).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = {
      ...eventsData.events[0],
      startTime: '25:00',
    } as Event;

    expect(convertEventToDateRange(event)).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1 = eventsData.events[0] as Event;
    const event2 = eventsData.events[0] as Event;

    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1 = eventsData.events[0] as Event;
    const event2 = eventsData.events[1] as Event;

    expect(isOverlapping(event1, event2)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent = {
      id: '9',
      title: '겹치는 회의',
      date: '2025-10-15',
      startTime: '09:30',
      endTime: '10:30',
      description: '겹치는 시간대의 회의',
      location: '회의실 F',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    } as Event;
    const events = eventsData.events as Event[];

    expect(findOverlappingEvents(newEvent, events)).toEqual([events[0]]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent = {
      id: '9',
      title: '겹치지 않는 회의',
      date: '2025-12-15',
      startTime: '09:30',
      endTime: '10:30',
      description: '겹치는 시간대의 회의',
      location: '회의실 F',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    } as Event;
    const events = eventsData.events as Event[];

    expect(findOverlappingEvents(newEvent, events)).toEqual([]);
  });
});
