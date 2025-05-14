import { sampleEvents } from '../../__mocks__/mocksData';
import { Event } from '../../entities/event/model/types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../shared/utils/eventOverlap';
import { createEvent } from '../utils';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const date = '2025-07-01';
    const time = '14:30';
    const result = parseDateTime(date, time);

    expect(result).toBeInstanceOf(Date);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const invalidDateCases = [
      ['2025-13-01', '14:30'], // 잘못된 월
      ['2025-07-32', '14:30'], // 잘못된 일
      ['2025/07/01', '14:30'], // 잘못된 구분자
      ['invalid', '14:30'], // 잘못된 형식
    ];

    invalidDateCases.forEach(([date, time]) => {
      const result = parseDateTime(date, time);
      expect(result.toString()).toBe('Invalid Date');
      expect(result.getTime()).toBeNaN();
    });
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const invalidTimeCases = [
      ['2025-07-01', '25:00'], // 잘못된 시간
      ['2025-07-01', '14:60'], // 잘못된 분
      ['2025-07-01', '14.30'], // 잘못된 구분자
      ['2025-07-01', 'invalid'], // 잘못된 형식
    ];

    invalidTimeCases.forEach(([date, time]) => {
      const result = parseDateTime(date, time);
      expect(result.toString()).toBe('Invalid Date');
      expect(result.getTime()).toBeNaN();
    });
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const emptyCases = [
      ['', '14:30'], // 빈 날짜
      ['2025-07-01', ''], // 빈 시간
      ['', ''], // 둘 다 빈 경우
    ];

    emptyCases.forEach(([date, time]) => {
      const result = parseDateTime(date, time);
      expect(result.toString()).toBe('Invalid Date');
      expect(result.getTime()).toBeNaN();
    });
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const result = convertEventToDateRange(sampleEvents[0]);

    expect(result).toHaveProperty('start');
    expect(result).toHaveProperty('end');

    expect(result.start).toBeInstanceOf(Date);
    expect(result.end).toBeInstanceOf(Date);

    expect(result.start).toEqual(new Date('2024-03-01T01:00:00.000Z'));
    expect(result.end).toEqual(new Date('2024-03-01T02:00:00.000Z'));

    expect(result.start.getTime()).toBeLessThan(result.end.getTime());
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const invalidDateEvents = [
      {
        id: '1',
        title: '미팅',
        date: '2024-13-20', // 잘못된 월
        startTime: '14:30',
        endTime: '16:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none' as const, interval: 1 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '미팅',
        date: '2024-03-32', // 잘못된 일
        startTime: '14:30',
        endTime: '16:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none' as const, interval: 1 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '미팅',
        date: 'invalid-date', // 잘못된 형식
        startTime: '14:30',
        endTime: '16:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none' as const, interval: 1 },
        notificationTime: 10,
      },
    ];

    invalidDateEvents.forEach((event) => {
      const result = convertEventToDateRange(event);
      expect(result.start.toString()).toBe('Invalid Date');
      expect(result.end.toString()).toBe('Invalid Date');
    });
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const invalidTimeEvents = [
      {
        id: '1',
        title: '미팅',
        date: '2024-03-20',
        startTime: '25:00', // 잘못된 시간
        endTime: '16:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none' as const, interval: 1 },
        notificationTime: 10,
      },
    ];

    invalidTimeEvents.forEach((event) => {
      const result = convertEventToDateRange(event);

      console.log(result.start, result.end);
      // getTime()을 사용한 검증
      expect(isNaN(result.start.getTime())).toBe(true);
      expect(isNaN(result.end.getTime())).toBe(false);
    });
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1 = createEvent('1', '2025-05-20', '10:00', '12:00');
    const event2 = createEvent('2', '2025-05-20', '11:00', '13:00');

    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1 = createEvent('1', '2025-05-20', '10:00', '11:00');
    const event2 = createEvent('2', '2025-05-20', '12:00', '13:00');

    expect(isOverlapping(event1, event2)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    // 기존 이벤트 목록
    const existingEvents = [
      createEvent('1', '2024-03-20', '09:00', '10:00'), // 겹치지 않음
      createEvent('2', '2024-03-20', '10:30', '11:30'), // 겹침
      createEvent('3', '2024-03-20', '11:00', '12:00'), // 겹침
      createEvent('4', '2024-03-20', '13:00', '14:00'), // 겹치지 않음
    ];

    // 새로운 이벤트
    const newEvent = createEvent('5', '2024-03-20', '11:00', '12:30');

    const overlappingEvents = findOverlappingEvents(newEvent, existingEvents);

    // 겹치는 이벤트가 2개여야 함
    expect(overlappingEvents).toHaveLength(2);
    // ID가 2, 3인 이벤트가 겹치는지 확인
    expect(overlappingEvents.map((e) => e.id)).toEqual(['2', '3']);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const existingEvents = [
      createEvent('1', '2024-03-20', '09:00', '10:00'),
      createEvent('2', '2024-03-20', '13:00', '14:00'),
      createEvent('3', '2024-03-20', '15:00', '16:00'),
    ];

    // 겹치지 않는 새로운 이벤트
    const newEvent = createEvent('4', '2024-03-20', '11:00', '12:00');

    const overlappingEvents = findOverlappingEvents(newEvent, existingEvents);

    // 빈 배열이 반환되어야 함
    expect(overlappingEvents).toEqual([]);
    expect(overlappingEvents).toHaveLength(0);
  });
});
