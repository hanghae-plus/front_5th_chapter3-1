import { Event, EventForm } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2025-07-01과 14:30을 정확한 Date 객체로 변환한다', () => {
    const date = '2025-07-01';
    const time = '14:30';
    const result = parseDateTime(date, time);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(6); // 0-based month
    expect(result.getDate()).toBe(1);
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const invalidDate = '2025-13-01';
    const time = '14:30';
    const result = parseDateTime(invalidDate, time);
    expect(result.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const date = '2025-07-01';
    const invalidTime = '25:30';
    const result = parseDateTime(date, invalidTime);
    expect(result.toString()).toBe('Invalid Date');
  });
});

describe('convertEventToDateRange', () => {
  const validEvent: Event = {
    id: '1',
    title: 'Test Event',
    date: '2025-07-01',
    startTime: '14:30',
    endTime: '15:30',
    description: 'Test Description',
    location: 'Test Location',
    category: 'Test Category',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  it('Event 타입의 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const result = convertEventToDateRange(validEvent);
    expect(result.start.getFullYear()).toBe(2025);
    expect(result.start.getMonth()).toBe(6);
    expect(result.start.getDate()).toBe(1);
    expect(result.start.getHours()).toBe(14);
    expect(result.start.getMinutes()).toBe(30);
    expect(result.end.getHours()).toBe(15);
    expect(result.end.getMinutes()).toBe(30);
  });

  it('EventForm 타입의 이벤트도 올바르게 변환한다', () => {
    const eventForm: EventForm = {
      title: 'Test Event',
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
      description: 'Test Description',
      location: 'Test Location',
      category: 'Test Category',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };
    const result = convertEventToDateRange(eventForm);
    expect(result.start.getFullYear()).toBe(2025);
    expect(result.end.getHours()).toBe(15);
  });
});

describe('isOverlapping', () => {
  const baseEvent: Event = {
    id: '1',
    title: 'Base Event',
    date: '2025-07-01',
    startTime: '14:00',
    endTime: '15:00',
    description: 'Base Description',
    location: 'Base Location',
    category: 'Base Category',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const overlappingEvent: Event = {
      ...baseEvent,
      id: '2',
      startTime: '14:30',
      endTime: '15:30',
    };
    expect(isOverlapping(baseEvent, overlappingEvent)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const nonOverlappingEvent: Event = {
      ...baseEvent,
      id: '2',
      startTime: '15:30',
      endTime: '16:30',
    };
    expect(isOverlapping(baseEvent, nonOverlappingEvent)).toBe(false);
  });

  it('EventForm 타입의 이벤트와도 정상적으로 동작한다', () => {
    const eventForm: EventForm = {
      title: 'Form Event',
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
      description: 'Form Description',
      location: 'Form Location',
      category: 'Form Category',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };
    expect(isOverlapping(baseEvent, eventForm)).toBe(true);
  });
});

describe('findOverlappingEvents', () => {
  const baseEvent: Event = {
    id: '1',
    title: 'Base Event',
    date: '2025-07-01',
    startTime: '14:00',
    endTime: '15:00',
    description: 'Base Description',
    location: 'Base Location',
    category: 'Base Category',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  const existingEvents: Event[] = [
    {
      id: '2',
      title: 'Overlapping Event 1',
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
      description: 'Overlapping Description 1',
      location: 'Overlapping Location 1',
      category: 'Overlapping Category 1',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '3',
      title: 'Non-Overlapping Event',
      date: '2025-07-01',
      startTime: '15:30',
      endTime: '16:30',
      description: 'Non-Overlapping Description',
      location: 'Non-Overlapping Location',
      category: 'Non-Overlapping Category',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const result = findOverlappingEvents(baseEvent, existingEvents);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const nonOverlappingEvent: Event = {
      ...baseEvent,
      id: '4',
      startTime: '5:00',
      endTime: '6:00',
    };

    const result = findOverlappingEvents(nonOverlappingEvent, existingEvents);
    expect(result).toHaveLength(0);
  });

  it('자기 자신의 id를 가진 이벤트는 제외한다', () => {
    const result = findOverlappingEvents(baseEvent, [baseEvent, ...existingEvents]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });
});
