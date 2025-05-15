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
    const expectedDate = new Date('2025-07-01T14:30:00');
    const result = parseDateTime(date, time);

    expect(result).toEqual(expectedDate);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const date = '2025-07-32';
    const time = '14:30';
    const expectedDate = new Date('Invalid Date');
    const result = parseDateTime(date, time);

    expect(result).toEqual(expectedDate);
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const date = '2025-07-01';
    const time = '25:00';
    const expectedDate = new Date('Invalid Date');
    const result = parseDateTime(date, time);

    expect(result).toEqual(expectedDate);
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const date = '';
    const time = '14:30';
    const expectedDate = new Date('Invalid Date');
    const result = parseDateTime(date, time);

    expect(result).toEqual(expectedDate);
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event: Event = {
      id: '1',
      title: '테스트 회의',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:30',
      description: '테스트 회의 설명',
      location: '항해 젭 12팀 회의실',
      category: '테스트코드',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    };

    const expectedDateRange = {
      start: new Date('2025-07-01T10:00:00'),
      end: new Date('2025-07-01T11:30:00'),
    };

    const result = convertEventToDateRange(event);

    expect(result).toEqual(expectedDateRange);
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '1',
      title: '테스트 회의',
      date: '2025-13-32',
      startTime: '10:00',
      endTime: '11:30',
      description: '테스트 회의 설명',
      location: '항해 젭 12팀 회의실',
      category: '테스트코드',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    };

    const expectedDateRange = {
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    };

    const result = convertEventToDateRange(event);

    expect(result).toEqual(expectedDateRange);
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '1',
      title: '테스트 회의',
      date: '2025-07-01',
      startTime: '25:00',
      endTime: '26:30',
      description: '테스트 회의 설명',
      location: '항해 젭 12팀 회의실',
      category: '테스트코드',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    };

    const expectedDateRange = {
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    };

    const result = convertEventToDateRange(event);

    expect(result).toEqual(expectedDateRange);
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1: Event = {
      id: '1',
      title: '테스트 회의',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:30',
      description: '테스트 회의 설명',
      location: '항해 젭 12팀 회의실',
      category: '테스트코드',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    };

    const event2: Event = {
      id: '2',
      title: '테스트 회의2',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:30',
      description: '테스트 회의 설명2',
      location: '항해 젭 12팀 회의실2',
      category: '테스트코드2',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    };

    const result = isOverlapping(event1, event2);

    expect(result).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1: Event = {
      id: '1',
      title: '테스트 회의',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:30',
      description: '테스트 회의 설명',
      location: '항해 젭 12팀 회의실',
      category: '테스트코드',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    };

    const event2: Event = {
      id: '2',
      title: '테스트 회의2',
      date: '2025-07-02',
      startTime: '10:00',
      endTime: '11:30',
      description: '테스트 회의 설명2',
      location: '항해 젭 12팀 회의실2',
      category: '테스트코드2',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    };

    const result = isOverlapping(event1, event2);

    expect(result).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const event1: Event = {
      id: '1',
      title: '테스트 회의',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:30',
      description: '테스트 회의 설명',
      location: '항해 젭 12팀 회의실',
      category: '테스트코드',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    };

    const event2: Event = {
      id: '2',
      title: '테스트 회의2',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:30',
      description: '테스트 회의 설명2',
      location: '항해 젭 12팀 회의실2',
      category: '테스트코드2',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    };

    const event3: Event = {
      id: '3',
      title: '테스트 회의3',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:30',
      description: '테스트 회의 설명3',
      location: '항해 젭 12팀 회의실3',
      category: '테스트코드3',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    };

    const events = [event1, event2, event3];
    const result = findOverlappingEvents(event1, events);

    expect(result).toEqual([event2, event3]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const event1: Event = {
      id: '1',
      title: '테스트 회의',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:30',
      description: '테스트 회의 설명',
      location: '항해 젭 12팀 회의실',
      category: '테스트코드',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    };

    const event2: Event = {
      id: '2',
      title: '테스트 회의2',
      date: '2025-07-02',
      startTime: '10:00',
      endTime: '11:30',
      description: '테스트 회의 설명2',
      location: '항해 젭 12팀 회의실2',
      category: '테스트코드2',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    };

    const event3: Event = {
      id: '3',
      title: '테스트 회의3',
      date: '2025-07-03',
      startTime: '10:00',
      endTime: '11:30',
      description: '테스트 회의 설명3',
      location: '항해 젭 12팀 회의실3',
      category: '테스트코드3',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    };

    const events = [event1, event2, event3];
    const result = findOverlappingEvents(event1, events);

    expect(result).toEqual([]);
  });
});
