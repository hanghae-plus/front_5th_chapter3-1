import {Event} from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';
import {expect} from "vitest";

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    expect(parseDateTime('2025-07-01', '14:30')).toEqual(new Date('2025-07-01T14:30'))
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const invalidDate = parseDateTime('yyyymmdd', '14:30');
    expect(invalidDate).toBeInstanceOf(Date)
    expect(Number.isNaN(invalidDate.getTime())).toBe(true)
    expect(invalidDate.toString()).toBe('Invalid Date')
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const invalidDate = parseDateTime('2025-07-01', 'hh:mm');
    expect(invalidDate).toBeInstanceOf(Date)
    expect(Number.isNaN(invalidDate.getTime())).toBe(true)
    expect(invalidDate.toString()).toBe('Invalid Date')
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const invalidDate = parseDateTime('', '14:30');
    expect(invalidDate).toBeInstanceOf(Date)
    expect(Number.isNaN(invalidDate.getTime())).toBe(true)
    expect(invalidDate.toString()).toBe('Invalid Date')
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event = {
      date: '2025-05-01',
      startTime: '09:00',
      endTime: '11:00',
    } as Event;

    const {start, end} = convertEventToDateRange(event);

    expect(start).toEqual(new Date('2025-05-01T09:00'));
    expect(end).toEqual(new Date('2025-05-01T11:00'));
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = {
      date: 'yyyymmdd',
      startTime: '09:00',
      endTime: '11:00',
    } as Event;

    const {start, end} = convertEventToDateRange(event);

    expect(start).toBeInstanceOf(Date)
    expect(Number.isNaN(start.getTime())).toBe(true)
    expect(start.toString()).toBe('Invalid Date')
    expect(end).toBeInstanceOf(Date)
    expect(Number.isNaN(end.getTime())).toBe(true)
    expect(end.toString()).toBe('Invalid Date')
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = {
      date: '2025-05-01',
      startTime: '09:00',
      endTime: 'hhmm',
    } as Event;

    const {start, end} = convertEventToDateRange(event);

    expect(start).toEqual(new Date('2025-05-01T09:00'));
    expect(end).toBeInstanceOf(Date)
    expect(Number.isNaN(end.getTime())).toBe(true)
    expect(end.toString()).toBe('Invalid Date')
  });
});

describe('isOverlapping', () => {
  const event1: Event = {
    "id": "1",
    "title": "기존 회의1",
    "date": "2025-05-02",
    "startTime": "09:00",
    "endTime": "12:00",
    "description": "기존 팀 미팅",
    "location": "회의실 B",
    "category": "업무",
    "repeat": {"type": "none", "interval": 0},
    "notificationTime": 10
  }
  const event2: Event = {
    "id": "2",
    "title": "기존 회의2",
    "date": "2025-05-02",
    "startTime": "11:00",
    "endTime": "13:00",
    "description": "기존 팀 미팅",
    "location": "회의실 B",
    "category": "업무",
    "repeat": {"type": "none", "interval": 0},
    "notificationTime": 10
  }
  const event3: Event = {
    "id": "3",
    "title": "기존 회의3",
    "date": "2025-05-2",
    "startTime": "14:00",
    "endTime": "16:00",
    "description": "기존 팀 미팅",
    "location": "회의실 B",
    "category": "업무",
    "repeat": {"type": "none", "interval": 0},
    "notificationTime": 10
  }

  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    expect(isOverlapping(event1, event2)).toBe(true)
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    expect(isOverlapping(event1, event3)).toBe(false)
  });
});

describe('findOverlappingEvents', () => {
  const event1: Event = {
    "id": "1",
    "title": "기존 회의1",
    "date": "2025-05-02",
    "startTime": "09:00",
    "endTime": "12:00",
    "description": "기존 팀 미팅",
    "location": "회의실 B",
    "category": "업무",
    "repeat": {"type": "none", "interval": 0},
    "notificationTime": 10
  }
  const event2: Event = {
    "id": "2",
    "title": "기존 회의2",
    "date": "2025-05-02",
    "startTime": "14:00",
    "endTime": "16:00",
    "description": "기존 팀 미팅",
    "location": "회의실 B",
    "category": "업무",
    "repeat": {"type": "none", "interval": 0},
    "notificationTime": 10
  }

  const events = [event1, event2]

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent = {
      "date": "2025-05-02",
      "startTime": "11:00",
      "endTime": "15:00"
    } as Event

    expect(findOverlappingEvents(newEvent, events)).toEqual([event1, event2])
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent = {
      "date": "2025-05-02",
      "startTime": "12:00",
      "endTime": "13:00"
    } as Event

    expect(findOverlappingEvents(newEvent, events)).toEqual([])
  });
});
