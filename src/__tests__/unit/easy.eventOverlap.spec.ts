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

    expect(result).toBeInstanceOf(Date);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(6); // 0-based 월 인덱스 (7월은 6)
    expect(result.getDate()).toBe(1);
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const date = 'invalid-date';
    const time = '14:30';
    const result = parseDateTime(date, time);

    expect(result.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const date = '2025-07-01';
    const time = 'invalid-time';
    const result = parseDateTime(date, time);

    expect(result.toString()).toBe('Invalid Date');
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const date = '';
    const time = '14:30';
    const result = parseDateTime(date, time);

    expect(result.toString()).toBe('Invalid Date');
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event: Event = {
      id: '1',
      title: '회의',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const result = convertEventToDateRange(event);

    expect(result.start).toBeInstanceOf(Date);
    expect(result.end).toBeInstanceOf(Date);
    expect(result.start.getHours()).toBe(10);
    expect(result.start.getMinutes()).toBe(0);
    expect(result.end.getHours()).toBe(11);
    expect(result.end.getMinutes()).toBe(0);
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '1',
      title: '회의',
      date: 'invalid-date',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const result = convertEventToDateRange(event);

    expect(result.start.toString()).toBe('Invalid Date');
    expect(result.end.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '1',
      title: '회의',
      date: '2025-07-01',
      startTime: 'invalid-time',
      endTime: '11:00',
      description: '팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const result = convertEventToDateRange(event);

    expect(result.start.toString()).toBe('Invalid Date');
    expect(result.end.toString()).not.toBe('Invalid Date');
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1: Event = {
      id: '1',
      title: '회의 1',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const event2: Event = {
      id: '2',
      title: '회의 2',
      date: '2025-07-01',
      startTime: '10:30',
      endTime: '11:30',
      description: '일정 논의',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    // 겹치는 시간: 10:30 - 11:00
    expect(isOverlapping(event1, event2)).toBe(true);

    // 순서 바꿔도 동일한 결과
    expect(isOverlapping(event2, event1)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1: Event = {
      id: '1',
      title: '회의 1',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const event2: Event = {
      id: '2',
      title: '회의 2',
      date: '2025-07-01',
      startTime: '11:00',
      endTime: '12:00',
      description: '일정 논의',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    // 겹치지 않음 (정확히 인접)
    expect(isOverlapping(event1, event2)).toBe(false);

    // 순서 바꿔도 동일한 결과
    expect(isOverlapping(event2, event1)).toBe(false);

    // 완전히 다른 시간
    const event3: Event = {
      id: '3',
      title: '회의 3',
      date: '2025-07-01',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 회의',
      location: '회의실 C',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    expect(isOverlapping(event1, event3)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent: Event = {
      id: 'new',
      title: '새 회의',
      date: '2025-07-01',
      startTime: '10:30',
      endTime: '12:30',
      description: '새 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const existingEvents: Event[] = [
      {
        id: '1',
        title: '회의 1',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '회의 2',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '일정 논의',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '회의 3',
        date: '2025-07-01',
        startTime: '11:30',
        endTime: '12:00',
        description: '프로젝트 회의',
        location: '회의실 C',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '4',
        title: '회의 4',
        date: '2025-07-01',
        startTime: '13:00',
        endTime: '14:00',
        description: '일정 리뷰',
        location: '회의실 D',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    const result = findOverlappingEvents(newEvent, existingEvents);

    // 회의 2, 회의 3이 새 회의와 겹침
    expect(result).toHaveLength(2);
    expect(result.map((e) => e.id)).toContain('2');
    expect(result.map((e) => e.id)).toContain('3');
    expect(result.map((e) => e.id)).not.toContain('1');
    expect(result.map((e) => e.id)).not.toContain('4');
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: Event = {
      id: 'new',
      title: '새 회의',
      date: '2025-07-01',
      startTime: '15:00',
      endTime: '16:00',
      description: '새 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const existingEvents: Event[] = [
      {
        id: '1',
        title: '회의 1',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '회의 2',
        date: '2025-07-01',
        startTime: '13:00',
        endTime: '14:00',
        description: '일정 리뷰',
        location: '회의실 D',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    const result = findOverlappingEvents(newEvent, existingEvents);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });
});
