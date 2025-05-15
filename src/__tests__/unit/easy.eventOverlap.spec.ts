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

    expect(result instanceof Date).toBe(true);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(6); // 0-based index, 7월은 6
    expect(result.getDate()).toBe(1);
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('잘못된 날짜', '14:30');

    expect(isNaN(result.getTime())).toBe(true);
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-05-15', '잘못된 시간');

    expect(isNaN(result.getTime())).toBe(true);
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('', '14:30');

    expect(isNaN(result.getTime())).toBe(true);
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const sampleEvent = {
      date: '2025-05-15',
      startTime: '09:00',
      endTime: '10:30',
      id: '1',
      title: '테스트 이벤트',
      description: '설명',
      location: '장소',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10
    };

    const result = convertEventToDateRange(sampleEvent);

    expect(result.start instanceof Date).toBe(true);
    expect(result.end instanceof Date).toBe(true);
    expect(result.start.getHours()).toBe(9);
    expect(result.start.getMinutes()).toBe(0);
    expect(result.end.getHours()).toBe(10);
    expect(result.end.getMinutes()).toBe(30);
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const sampleEvent = {
      date: '잘못된 날짜',
      startTime: '09:00',
      endTime: '10:30',
      id: '1',
      title: '테스트 이벤트',
      description: '설명',
      location: '장소',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10
    };

    const result = convertEventToDateRange(sampleEvent);

    expect(isNaN(result.start.getTime())).toBe(true);
    expect(isNaN(result.end.getTime())).toBe(true);
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = {
      date: '2025-05-15',
      startTime: '잘못된 시간',
      endTime: '10:30',
      id: '1',
      title: '테스트 이벤트',
      description: '설명',
      location: '장소',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10
    };

    const result = convertEventToDateRange(event);

    expect(isNaN(result.start.getTime())).toBe(true);
    expect(result.end instanceof Date).toBe(true);
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1 = {
      date: '2025-05-15',
      startTime: '09:00',
      endTime: '11:00',
      id: '1',
      title: '이벤트 1',
      description: '설명',
      location: '장소',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10
    };

    const event2 = {
      date: '2025-05-15',
      startTime: '10:00',
      endTime: '12:00',
      id: '2',
      title: '이벤트 2',
      description: '설명',
      location: '장소',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10
    };

    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1 = {
      date: '2025-05-15',
      startTime: '09:00',
      endTime: '10:00',
      id: '1',
      title: '이벤트 1',
      description: '설명',
      location: '장소',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10
    };

    const event2 = {
      date: '2025-05-15',
      startTime: '11:00',
      endTime: '12:00',
      id: '2',
      title: '이벤트 2',
      description: '설명',
      location: '장소',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10
    };

    expect(isOverlapping(event1, event2)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent = {
      date: '2025-05-15',
      startTime: '10:00',
      endTime: '12:00',
      id: '1',
      title: '새 이벤트',
      description: '설명',
      location: '장소',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10
    };

    const existingEvents = [
      {
        date: '2025-05-15',
        startTime: '09:00',
        endTime: '11:00',
        id: '2',
        title: '겹치는 이벤트 1',
        description: '설명',
        location: '장소',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10
      },
      {
        date: '2025-05-15',
        startTime: '13:00',
        endTime: '14:00',
        id: '3',
        title: '겹치지 않는 이벤트',
        description: '설명',
        location: '장소',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10
      },
      {
        date: '2025-05-15',
        startTime: '11:30',
        endTime: '12:30',
        id: '4',
        title: '겹치는 이벤트 2',
        description: '설명',
        location: '장소',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10
      }
    ];

    const result = findOverlappingEvents(newEvent, existingEvents);

    expect(result.length).toBe(2);
    expect(result.map(event => event.id)).toContain('2');
    expect(result.map(event => event.id)).toContain('4');
    expect(result.map(event => event.id)).not.toContain('3');
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent = {
      date: '2025-05-15',
      startTime: '15:00',
      endTime: '16:00',
      id: '1',
      title: '새 이벤트',
      description: '설명',
      location: '장소',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10
    };

    const existingEvents = [
      {
        date: '2025-05-15',
        startTime: '09:00',
        endTime: '10:00',
        id: '2',
        title: '겹치지 않는 이벤트 1',
        description: '설명',
        location: '장소',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10
      },
      {
        date: '2025-05-15',
        startTime: '13:00',
        endTime: '14:00',
        id: '3',
        title: '겹치지 않는 이벤트 2',
        description: '설명',
        location: '장소',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10
      }
    ];

    const result = findOverlappingEvents(newEvent, existingEvents);

    expect(result.length).toBe(0);
    expect(result).toEqual([]);
  });
});
