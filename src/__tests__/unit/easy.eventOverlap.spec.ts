import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
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
    const date = '2025-13-45'; // 잘못된 날짜
    const time = '14:30';
    const result = parseDateTime(date, time);

    expect(isNaN(result.getTime())).toBe(true);
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const date = '2025-07-01';
    const time = '25:70'; // 잘못된 시간
    const result = parseDateTime(date, time);

    expect(isNaN(result.getTime())).toBe(true);
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const date = '';
    const time = '14:30';
    const result = parseDateTime(date, time);

    expect(isNaN(result.getTime())).toBe(true);
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event: Event = {
      id: '1',
      title: '테스트 이벤트',
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '16:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트 카테고리',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 30,
    };

    const result = convertEventToDateRange(event);

    expect(result.start.getFullYear()).toBe(2025);
    expect(result.start.getMonth()).toBe(6);
    expect(result.start.getDate()).toBe(1);
    expect(result.start.getHours()).toBe(14);
    expect(result.start.getMinutes()).toBe(30);

    expect(result.end.getFullYear()).toBe(2025);
    expect(result.end.getMonth()).toBe(6);
    expect(result.end.getDate()).toBe(1);
    expect(result.end.getHours()).toBe(16);
    expect(result.end.getMinutes()).toBe(0);
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '1',
      title: '테스트 이벤트',
      date: '2025-13-45', // 잘못된 날짜
      startTime: '14:30',
      endTime: '16:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트 카테고리',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 30,
    };

    const result = convertEventToDateRange(event);

    expect(isNaN(result.start.getTime())).toBe(true);
    expect(isNaN(result.end.getTime())).toBe(true);
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '1',
      title: '테스트 이벤트',
      date: '2025-07-01',
      startTime: '25:70',
      endTime: '77:70',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트 카테고리',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 30,
    };

    const result = convertEventToDateRange(event);
    console.log('result', result);
    expect(isNaN(result.start.getTime())).toBe(true);
    expect(isNaN(result.end.getTime())).toBe(true);
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1: Event = {
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01',
      startTime: '14:00',
      endTime: '16:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트 카테고리',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 30,
    };

    const event2: Event = {
      id: '2',
      title: '이벤트 2',
      date: '2025-07-01',
      startTime: '15:00',
      endTime: '17:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트 카테고리',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 30,
    };

    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1: Event = {
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01',
      startTime: '14:00',
      endTime: '15:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트 카테고리',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 30,
    };

    const event2: Event = {
      id: '2',
      title: '이벤트 2',
      date: '2025-07-01',
      startTime: '16:00',
      endTime: '17:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트 카테고리',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 30,
    };

    expect(isOverlapping(event1, event2)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent: Event = {
      id: '3',
      title: '새 이벤트',
      date: '2025-07-01',
      startTime: '15:00',
      endTime: '16:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트 카테고리',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 30,
    };

    const existingEvents: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '14:00',
        endTime: '15:30',
        description: '테스트 설명',
        location: '테스트 장소',
        category: '테스트 카테고리',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 30,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-01',
        startTime: '15:30',
        endTime: '17:00',
        description: '테스트 설명',
        location: '테스트 장소',
        category: '테스트 카테고리',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 30,
      },
    ];

    const result = findOverlappingEvents(newEvent, existingEvents);

    expect(result.length).toBe(2);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('2');
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: Event = {
      id: '3',
      title: '새 이벤트',
      date: '2025-07-01',
      startTime: '15:00',
      endTime: '16:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트 카테고리',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 30,
    };

    const existingEvents: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '13:00',
        endTime: '14:00',
        description: '테스트 설명',
        location: '테스트 장소',
        category: '테스트 카테고리',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 30,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-01',
        startTime: '17:00',
        endTime: '18:00',
        description: '테스트 설명',
        location: '테스트 장소',
        category: '테스트 카테고리',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 30,
      },
    ];

    const result = findOverlappingEvents(newEvent, existingEvents);

    expect(result.length).toBe(0);
  });
});
