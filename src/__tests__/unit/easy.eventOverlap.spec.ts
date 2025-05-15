import mockEvents from '../../__mocks__/response/events.json';
import realEvents from '../../__mocks__/response/realEvents.json';
import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('날짜(2025-07-01), 시간(14:30)을 정확한 Date 객체로 변환한다', () => {
    const date = parseDateTime('2025-07-01', '14:30');
    expect(date).toBeInstanceOf(Date);
    expect(date.getFullYear()).toBe(2025);
    expect(date.getMonth()).toBe(6);
    expect(date.getDate()).toBe(1);
    expect(date.getHours()).toBe(14);
    expect(date.getMinutes()).toBe(30);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const date = parseDateTime('2025.07.01', '14:30');
    expect(date.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const date = parseDateTime('2025-07-01', '14.30');
    expect(date.toString()).toBe('Invalid Date');
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const date = parseDateTime('', '14.30');
    expect(date.toString()).toBe('Invalid Date');
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const eventTime = convertEventToDateRange(mockEvents.events[0] as Event);

    expect(eventTime.start).toBeInstanceOf(Date);
    expect(eventTime.start.getFullYear()).toBe(2025);
    expect(eventTime.start.getMonth()).toBe(9);
    expect(eventTime.start.getDate()).toBe(15);
    expect(eventTime.start.getHours()).toBe(9);
    expect(eventTime.start.getMinutes()).toBe(0);

    expect(eventTime.end).toBeInstanceOf(Date);
    expect(eventTime.end.getFullYear()).toBe(2025);
    expect(eventTime.end.getMonth()).toBe(9);
    expect(eventTime.end.getDate()).toBe(15);
    expect(eventTime.end.getHours()).toBe(10);
    expect(eventTime.end.getMinutes()).toBe(0);
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '1',
      title: '기존 회의',
      date: '2025.10.15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };
    const eventTime = convertEventToDateRange(event);
    expect(eventTime.start.toString()).toBe('Invalid Date');
    expect(eventTime.end.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '1',
      title: '기존 회의',
      date: '2025-10-15',
      startTime: '09.00',
      endTime: '10.00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };
    const eventTime = convertEventToDateRange(event);
    expect(eventTime.start.toString()).toBe('Invalid Date');
    expect(eventTime.end.toString()).toBe('Invalid Date');
  });
});

describe('isOverlapping', () => {
  const event1: Event = {
    id: '1',
    title: '기존 회의',
    date: '2025-05-14',
    startTime: '09:00',
    endTime: '10:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };
  const event2: Event = {
    id: '2',
    title: '추가 회의',
    date: '2025-05-14',
    startTime: '09:10',
    endTime: '09:55',
    description: '추가 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };
  const event3: Event = {
    id: '2',
    title: '추가 회의',
    date: '2025-05-15',
    startTime: '09:10',
    endTime: '09:55',
    description: '추가 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    expect(isOverlapping(event1, event3)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const overlapEvent: Event = {
      id: '1',
      title: '겹치는 회의',
      date: '2025-05-25',
      startTime: '09:00',
      endTime: '10:00',
      description: '겹치는 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };
    const events = realEvents.events as Event[];
    const result = findOverlappingEvents(overlapEvent, events);
    expect(result.length).toBe(1);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const notOverlapEvent: Event = {
      id: '1',
      title: '기존 회의',
      date: '2025-05-14',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };
    const events = realEvents.events as Event[];
    const result = findOverlappingEvents(notOverlapEvent, events);
    expect(result.length).toBe(0);
  });
});
